const core = require('@actions/core');
const github = require('@actions/github');

const keyPhrases = 'depends on|blocked by';
const plainTextRegex = new RegExp(`(${keyPhrases}) #(\d+)`, 'gmi');
const markdownRegex = new RegExp(`(${keyPhrases}) \[.*\]\((.*\/\d+)\)`, 'gmi');
const prRegex = /https:\/\/github\.com\/(\w+)\/([-._a-z0-9]+)\/pull\/(\d+)/gmi

function getDependency(line) {
    var match = plainTextRegex.exec(line);
    if (match !== null) {
        return {
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: parseInt(match[2], 10)
        };
    }

    match = plainTextRegex.exec(line);
    if (match !== null) {
        var url = match[3];
        match = prRegex.exec(url);
        return {
            owner: match[1],
            repo: match[2],
            pull_number: parseInt(match[3], 10)
        };
    }

    return null;
};

async function run() {
    try {
        const myToken = process.env.GITHUB_TOKEN;
        const octokit = github.getOctokit(myToken);

        const { data: pullRequest } = await octokit.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.issue.number,
        });

        const lines = pullRequest.body.split(/\r\n|\r|\n/);
        
        var dependencies = [];
        lines.forEach(l => {
            var dependency = getDependency(l);
            if (dependency !== null)
                dependencies.push(dependency);
        });

        var dependencyPullRequests = [];
        for (var d of dependencies) {
            core.info(`Fetching '${d}'`)
            const { data: pr } = await octokit.pulls.get(d).catch(error => core.error(error));
            if (!pr) continue;
            if (!pr.merged && !pr.closed_at)
                dependencyPullRequests.push(pr);
        }

        if (dependencyPullRequests.length !== 0) {
            var msg = 'The following issues need to be resolved before this PR can be closed:\n'
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
