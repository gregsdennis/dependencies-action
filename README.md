# PR Dependency Check Action

This GitHub Action enforces PR dependencies as stated in a PR's opening comment.

The bot parses the first comment of a PR looking for the key phrases "depends on" or "blocked by" followed by an issue number specified by `#` and the issue or PR number (e.g. `#5`).

## Supported link styles

The action can detect links in the following styles:

- Quick Link: `#5`
- Partial Link: `gregsdennis/dependencies-action#5`
- Partial URL: `gregsdennis/dependencies-action/pull/5`
- Full URL: `https://github.com/gregsdennis/dependencies-action/pull/5`
- Markdown: `[markdown link](https://github.com/gregsdennis/dependencies-action/pull/5)`

Works for both issues and PRs!

Also supports custom domains for use with GitHub Enterprise!

## See it in action:

- [PR to be landed first](http://github.com/gregsdennis/dependencies-action/pull/4)
- [PR to be landed second](http://github.com/gregsdennis/dependencies-action/pull/5)

## Example usage

Just add the following to a `.yml` file in your `.github/workflows/` folder.

```yaml
on:
  pull_request_target: 
    types: [opened, edited, closed, reopened]

permissions:
  issues: read
  pull-requests: read

jobs:
  check_dependencies:
    runs-on: ubuntu-latest
    name: Check Dependencies
    steps:
    - uses: gregsdennis/dependencies-action@main
      with:
        custom-domains: my-custom-domain.io another.domain.com
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Permissions and the GitHub Token

This action interacts with the GitHub API, which requires the use of a token.

The standard `secrets.GITHUB_TOKEN` (as shown above) can be used when accessing issues and PRs on public repositories.

When your dependencies are issues or PRs found in private repositories, a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) (PAT) is required.  This PAT must have access to the target repositories.