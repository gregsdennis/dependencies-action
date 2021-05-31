# PR Dependency Check Action

This GitHub Action enforces PR dependencies as stated in a PR's opening comment.

The bot parses the first comment of a PR looking for the key phrases "depends on" or "blocked by" followed by an issue number specified by `#` and the issue or PR number (e.g. `#5`).

## Supported link styles

The action can detect links in the following styles:

- Quick Link: `#5`
- Partial Link: `gregsdennis/dependencies-action#5`
- Partial URL: `gregsdennis/dependencies-action/pulls/5`
- Full URL: `http://github.com/gregsdennis/dependencies-action/pulls/5`
- Markdown: `[markdown link](http://github.com/gregsdennis/dependencies-action/pulls/5)`

Works for both issues and PRs!

## See it in action:

- [PR to be landed first](http://github.com/gregsdennis/dependencies-action/pulls/4)
- [PR to be landed second](http://github.com/gregsdennis/dependencies-action/pulls/5)

## Example usage

Just add the following to a `.yml` file in your `.github/workflows/` folder.

```yaml
on: [pull_request]

jobs:
  check_dependencies:
    runs-on: ubuntu-latest
    name: Check Dependencies
    steps:
    - uses: gregsdennis/dependencies-action@main
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```