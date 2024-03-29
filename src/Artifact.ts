import {DefaultArtifactClient} from '@actions/artifact'
import {config} from 'dotenv';
import {myToken, octokit} from "./OctoKit";

const artifactClient = new DefaultArtifactClient()

const getEnvFile = () => {
    const myData = {};
    config({
        path: './publish-output/.env',
        processEnv: myData
    });
    return myData;
}

export const getArtifactData = async (params: {owner:string, repo:string}) => {
    const repoPullRequest = await octokit.rest.pulls.get({...params, pull_number: 112});
    const repoRuns = await octokit.actions.listWorkflowRunsForRepo({
        ...params,
        head_sha: repoPullRequest.data.head.sha
    });
    const repoRunArtifacts = await octokit.actions.listWorkflowRunArtifacts({
        ...params,
        run_id: repoRuns.data.workflow_runs[0].id,
        head_sha: repoPullRequest.data.head.sha,
        name: 'publish-output'
    })

    const publishArtifact = repoRunArtifacts.data.artifacts.pop();

    if (publishArtifact?.workflow_run?.id && publishArtifact?.id) {
        const aaa = await artifactClient.downloadArtifact(publishArtifact.id, {
            path: 'publish-output',
            findBy: {
                token: myToken,
                workflowRunId: publishArtifact?.workflow_run?.id,
                repositoryName: "vantage-backend",
                repositoryOwner: "Presight-AI",

            }
        });
        console.log('my-data', getEnvFile());
    }

}
