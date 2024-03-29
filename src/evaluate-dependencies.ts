import github from '@actions/github';
import {Octokit} from "@octokit/rest";
import {info, error, setFailed} from "@actions/core";
import {getAllDependencies} from "./BodyParser";

async function evaluate() {
    try {
        info('Initializing...');
        const myToken = process.env.MY_TOKEN || process.env.GITHUB_TOKEN;
        info(`Token acquired: ${myToken}`);
        const octokit = new Octokit({
            auth: myToken
        });

        const {data: pullRequest} = await octokit.rest.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.issue.number,
        });

        if (!pullRequest.body) {
            info('Body empty')
            return;
        }

        info('\nReading PR body...');

        const dependencies = getAllDependencies(pullRequest.body);

        info('\nAnalyzing lines...');
        const dependencyIssues: any[] = [];
        for (let d of dependencies) {
            info(`  Fetching '${JSON.stringify(d)}'`);
            let isPr = true;
            octokit.rest.actions.getArtifact
            const {data: pullRequest} = await octokit.rest.pulls.get({
                owner: d.owner,
                repo: d.repo,
                pull_number: d.pull_number,
            });

            if (isPr) {
                if (!pullRequest) continue;
                if (!pullRequest.merged && !pullRequest.closed_at) {
                    info('    PR is still open.');
                    dependencyIssues.push(pullRequest);
                } else {
                    info('    PR has been closed.');
                }
            }
        }

        if (dependencyIssues.length !== 0) {
            let msg = '\nThe following issues need to be resolved before this PR can be merged:\n';
            for (let pr of dependencyIssues) {
                msg += `\n#${pr.number} - ${pr.title}`;
            }
            setFailed(msg);
        } else {
            info("\nAll dependencies have been resolved!")
        }
    } catch (e: any) {
        setFailed(e.message);
        throw error;
    }
}

export {evaluate, getAllDependencies}