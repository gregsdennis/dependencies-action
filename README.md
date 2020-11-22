# PR Dependency Check Action

A GitHub Action that enforces PR dependencies

## Example usage

```yaml
on: [pull_request]

jobs:
  check_dependencies:
    runs-on: ubuntu-latest
    name: check dependencies
    steps:
    - uses: gregsdennis/dependencies-action@master
```