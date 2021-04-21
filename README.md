# Block Autosquash Commits Action

[![CI](https://github.com/xt0rted/block-autosquash-commits-action/workflows/CI/badge.svg)](https://github.com/xt0rted/block-autosquash-commits-action/actions?query=workflow%3ACI)

A Github Action to prevent merging pull requests containing [autosquash](https://git-scm.com/docs/git-rebase#git-rebase---autosquash) commit messages.

## How it works

If any commit message in the pull request starts with `fixup!` or `squash!` the check status will be set to `error`.

## Usage

```yaml
on: pull_request

name: Pull Requests

jobs:
  message-check:
    name: Block Autosquash Commits

    runs-on: ubuntu-latest

    steps:
      - name: Block Autosquash Commits
        uses: xt0rted/block-autosquash-commits-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

You'll also need to add a [required status check](https://help.github.com/en/articles/enabling-required-status-checks) rule for your action to block merging if it detects any `fixup!` or `squash!` commits.

### Control Permissions

If your repository is using [control permissions](https://github.blog/changelog/2021-04-20-github-actions-control-permissions-for-github_token/) you'll need to set `pull-request: read` on either the workflow or the job.

#### Workflow Config

```yaml
on: pull_request

name: Pull Request

permissions:
  pull-requests: read

jobs:
  message-check:
    name: Block Autosquash Commits

    runs-on: ubuntu-latest

    steps:
      - name: Block Autosquash Commits
        uses: xt0rted/block-autosquash-commits-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

#### Job Config

```yaml
on: pull_request

name: Pull Request

jobs:
  message-check:
    name: Block Autosquash Commits

    runs-on: ubuntu-latest

    permissions:
      pull-requests: read

    steps:
      - name: Block Autosquash Commits
        uses: xt0rted/block-autosquash-commits-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```
