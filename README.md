# PR Dependency Check Action

This GitHub Action enforces PR dependencies as stated in a PR's opening comment.

The bot parses the first comment of a PR looking for the key phrases "depends on" or "blocked by" followed by an issue number specified by `#` and the PR number (e.g. `#5`).

***NOTE** The parsing logic currently only looks for these formats, which means that it only support linking PRs from the same repository.  Please see the issues list for planned enhancements.*

## Example usage

```yaml
on: [pull_request]

jobs:
  check_dependencies:
    runs-on: ubuntu-latest
    name: Check Dependencies
    steps:
    - uses: gregsdennis/dependencies-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```