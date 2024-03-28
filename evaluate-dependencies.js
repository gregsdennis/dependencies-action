import {Octokit} from "@octokit/core";
import github from '@actions/github';
import {getInput, info, error, setFailed, debug} from "@actions/core";

var customDomains = getInput('custom-domains')?.split(/(\s+)/) ?? [];

const keyPhrases = 'depends on|blocked by';
const issueTypes = 'issues|pull';
const domainsList = ['github.com'].concat(customDomains); // add others from parameter
const domainsString = combineDomains(domainsList);

const quickLinkRegex = new RegExp(`(${keyPhrases}) #(\\d+)`, 'gmi');
const partialLinkRegex = new RegExp(`(${keyPhrases}) ([-_\\w]+)\\/([-._a-z0-9]+)(#)(\\d+)`, 'gmi');
const partialUrlRegex = new RegExp(`(${keyPhrases}) ([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)`, 'gmi');
const fullUrlRegex = new RegExp(`(${keyPhrases}) https?:\\/\\/(?:${domainsString})\\/([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)`, 'gmi');
const markdownRegex = new RegExp(`(${keyPhrases}) \\[.*\\]\\(https?:\\/\\/(?:${domainsString})\\/([-_\\w]+)\\/([-._a-z0-9]+)\\/(${issueTypes})\\/(\\d+)\\)`, 'gmi');

function escapeDomainForRegex(domain) {
    return domain.replace('.', '\\.');
}

function combineDomains(domains) {
    return domains.map(x => escapeDomainForRegex(x)).join("|");
}

function extractFromMatch(match) {
    return {
        owner: match[2],
        repo: match[3],
        pull_number: parseInt(match[5], 10)
    };
}

function getAllDependencies(body) {
    var allMatches = [];

    var quickLinkMatches = [...body.matchAll(quickLinkRegex)];
    if (quickLinkMatches.length !== 0) {
        quickLinkMatches.forEach(match => {
            info(`  Found number-referenced dependency in '${match}'`);
            allMatches.push({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                pull_number: parseInt(match[2], 10)
            });
        });
    }

    var extractableMatches = [...body.matchAll(partialLinkRegex)]
        .concat([...body.matchAll(partialUrlRegex)])
        .concat([...body.matchAll(fullUrlRegex)])
        .concat([...body.matchAll(markdownRegex)]);
    if (extractableMatches.length !== 0) {
        extractableMatches.forEach(match => {
            info(`  Found number-referenced dependency in '${match}'`);
            allMatches.push(extractFromMatch(match));
        });
    }

    return allMatches;
}

async function evaluate() {
    try {
        info('Initializing...');
        const myToken = process.env.MY_TOKEN || process.env.GITHUB_TOKEN;
        info(`Token acquired: ${myToken}`);
        const octokit = new Octokit({
            auth: myToken
        });

        const {data: pullRequest} = await octokit.request(`GET /repos/{owner}/{repo}/pulls/{pull_number}`, {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.issue.number,
        });

        if (!pullRequest.body) {
            info('body empty')
            return;
        }

        info('\nReading PR body...');
        debug(JSON.stringify(pullRequest.body));
        var dependencies = getAllDependencies(pullRequest.body);
        debug(JSON.stringify(dependencies));
        info('\nAnalyzing lines y10...');
        var dependencyIssues = [];
        for (var d of dependencies) {
            info(`  Fetching '${JSON.stringify(d)}'`);
            var isPr = true;
            var response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
                owner: d.owner,
                repo: d.repo,
                pull_number: d.pull_number,
                headers: {
                    "x-github-api-version": "2022-11-28",
                },
            }).catch(e => error(e));
            info('RESPONSE2:', JSON.stringify(response));
            info('-------------------');
            // if (response === undefined) {
            //     isPr = false;
            //     d = {
            //         owner: d.owner,
            //         repo: d.repo,
            //         issue_number: d.pull_number,
            //     };
            //     info(`  Fetching '${JSON.stringify(d)}'`);
            //     response = await octokit.rest.issues.get(d).catch(error => error(error));
            //     if (response === undefined) {
            //         info('    Could not locate this dependency.  Will need to verify manually.');
            //         continue;
            //     }
            // }
            if (isPr) {
                const {data: pr} = response;
                if (!pr) continue;
                if (!pr.merged && !pr.closed_at) {
                    info('    PR is still open.');
                    dependencyIssues.push(pr);
                } else {
                    info('    PR has been closed.');
                }
            } else {
                const {data: issue} = response;
                if (!issue) continue;
                if (!issue.closed_at) {
                    info('    Issue is still open.');
                    dependencyIssues.push(issue);
                } else {
                    info('    Issue has been closed.');
                }
            }
        }

        if (dependencyIssues.length !== 0) {
            var msg = '\nThe following issues need to be resolved before this PR can be merged:\n';
            for (var pr of dependencyIssues) {
                msg += `\n#${pr.number} - ${pr.title}`;
            }
            setFailed(msg);
        } else {
            info("\nAll dependencies have been resolved!")
        }
    } catch (e) {
        setFailed(e.message);
        throw error;
    }
}

export {evaluate, getAllDependencies}