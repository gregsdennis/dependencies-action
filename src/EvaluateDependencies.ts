import github from '@actions/github';
import {info, error, setFailed} from "@actions/core";
import {getAllDependencies} from "./BodyParser";
import {octokit} from "./OctoKit";
import {getArtifactData} from "./Artifact";

export const evaluate = async () => {
    try {
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
        for (let pullRequestDependency of dependencies) {
            info(`  Fetching '${JSON.stringify(pullRequestDependency)}'`);
            const {data: pullRequest} = await octokit.rest.pulls.get({...pullRequestDependency});

            if (!pullRequest) continue;
            if (!pullRequest.merged && !pullRequest.closed_at) {
                info('    PR is still open.');
                dependencyIssues.push(pullRequest);
            } else {
                info('    PR has been closed.');
            }
            getArtifactData({owner: pullRequestDependency.owner, repo: pullRequestDependency.repo});
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