# Block Autosquash Commits Action

[![CI](https://github.com/nineinchnick/block-commits-action/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/nineinchnick/block-commits-action/actions/workflows/ci.yml)
[![CodeQL](https://github.com/nineinchnick/block-commits-action/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/nineinchnick/block-commits-action/actions/workflows/codeql-analysis.yml)


A Github Action to prevent merging pull requests containing [merge
commits](https://git-scm.com/docs/git-merge) or commits with
[autosquash](https://git-scm.com/docs/git-rebase#git-rebase---autosquash)
messages.

## How it works

If any commit message in the pull request has more than one parent, or starts
with `fixup!` or `squash!` the action sets the check status to `error`.
Instead of failing, the action can be configured to create a review requesting changes.

> Warning:  GitHub's API only returns the first 250 commits of a PR so if you're
> working on a really large PR your fixup commits might not be detected.

## Usage

```yaml
on: pull_request

name: Pull Requests

jobs:
  message-check:
    name: Block Merge or Autosquash Commits

    runs-on: ubuntu-latest

    steps:
      - name: Block Merge or Autosquash Commits
        uses: nineinchnick/block-commits-action@v1
        with:
          action-merge: fail
          action-fixup: request-changes
```

You'll also need to add a [required status
check](https://help.github.com/en/articles/enabling-required-status-checks) rule
for your action to block merging if this action fails.

### Control Permissions

If your repository is using [control
permissions](https://github.blog/changelog/2021-04-20-github-actions-control-permissions-for-github_token/)
you'll need to set `pull-request: read` on either the workflow or the job.

#### Workflow Config

```yaml
on: pull_request

name: Pull Request

permissions:
  pull-requests: read

jobs:
  message-check:
    name: Block Merge and Autosquash Commits

    runs-on: ubuntu-latest

    steps:
      - name: Block Merge and Autosquash Commits
        uses: nineinchnick/block-commits-action@v2
```

#### Job Config

```yaml
on: pull_request

name: Pull Request

jobs:
  message-check:
    name: Block Merge and Autosquash Commits

    runs-on: ubuntu-latest

    permissions:
      pull-requests: read

    steps:
      - name: Block Merge and Autosquash Commits
        uses: nineinchnick/block-commits-action@v2
```
