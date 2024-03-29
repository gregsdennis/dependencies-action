import {info} from "@actions/core";
import {Octokit} from "@octokit/rest";

info('Initializing...');
export const myToken = process.env.MY_TOKEN || process.env.GITHUB_TOKEN || '';
info(`Token acquired: ${myToken}`);

export const octokit = new Octokit({
    auth: myToken
});
