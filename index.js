const core = require('@actions/core');
const github = require('@actions/github');

const keyPhrases = 'depends on|blocked by';
const plainTextRegex = new RegExp(`(${keyPhrases}) #(\\d+)`, 'gmi');
const markdownRegex = new RegExp(`(${keyPhrases}) \\[.*\\]\\(https:\\/\\/github\\.com\\/(\\w+)\\/([-._a-z0-9]+)\\/pull\\/(\\d+)\\)`, 'gmi');

function getDependency(line) {
    var match = plainTextRegex.exec(line);
    if (match !== null) {
        core.info(`Found number-referenced dependency in '${line}'`);
        return {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: parseInt(match[2], 10)
        };
    }

    match = markdownRegex.exec(line);
    if (match !== null) {
        core.info(`Found markdown dependency in '${line}'`);
        return {
            owner: match[1],
            repo: match[2],
            pull_number: parseInt(match[3], 10)
        };
    }

    core.info(`Found no dependency in '${line}'`);
    return null;
};

async function run() {
    try {
        core.info('Initializing...');
        const myToken = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(myToken);

        const { data: pullRequest } = await octokit.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.issue.number,
        });

        core.info('Reading PR body...');
        const lines = pullRequest.body.split(/\r\n|\r|\n/);
        
        var dependencies = [];
        lines.forEach(l => {
            var dependency = getDependency(l);
            if (dependency !== null)
                dependencies.push(dependency);
        });

        core.info('Analyzing lines...')
        var dependencyPullRequests = [];
        for (var d of dependencies) {
            core.info(`Fetching '${d}'`)
            const response = await octokit.pulls.get(d).catch(error => core.error(error));
            if (response === undefined || response === undefined) {
                core.info('Could not locate this dependency.  Will need to verify manually.')
            }
            const { data: pr } = response;
            if (!pr) continue;
            if (!pr.merged && !pr.closed_at)
                dependencyPullRequests.push(pr);
        }

        if (dependencyPullRequests.length !== 0) {
            var msg = 'The following issues need to be resolved before this PR can be closed:\n';
            for (var pr of dependencyPullRequests) {
                msg += `\n#${pr.number} - ${pr.title}`;
            }
            core.setFailed(msg);
        }
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}

run();
