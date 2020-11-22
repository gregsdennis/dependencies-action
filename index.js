const core = require('@actions/core');
const github = require('@actions/github');

function getDependency(line) {
    var rx = /^depends on #(\d+)\W*$/gmi;
    var match = rx.exec(line);
    if (match !== null)
        return parseInt(match[1], 10);
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

        core.info(pullRequest.body);
        const lines = pullRequest.body.split(/\r\n|\r|\n/);
        
        var dependencies = [];
        lines.forEach(l => {
            var dependency = getDependency(l);
            if (dependency !== null)
                dependencies.push(dependency);
        });
        core.info(dependencies);

        var dependencyPullRequests = [];
        for (var d of dependencies) {
            core.info(`Fetching '${github.context.repo.owner}/${github.context.repo.repo}/pulls/${d}'`)
            const { data: pr } = await octokit.pulls.get({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                pull_number: d,
            }).catch(error => core.error(error));
            if (!pr.merged && !pr.closed_at)
                dependencyPullRequests += d
        }

        if (dependencyPullRequests.length !== 0) {
            var msg = 'The following issues need to be resolved before this PR can be closed:\n'
            for (var d of dependencyPullRequests) {
                msg += `\n#${d}`;
            }
            core.setFailed(msg);
        }
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}

run();
