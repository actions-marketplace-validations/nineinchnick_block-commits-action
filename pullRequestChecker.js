const { debug, error } = require("@actions/core");
const {
    context,
    getOctokit,
} = require("@actions/github");

class PullRequestChecker {
    constructor(repoToken) {
        this.client = getOctokit(repoToken);
    }

    async process() {
        const commits = await this.client.paginate(
            "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
            {
                ...context.repo,
                pull_number: context.issue.number,
                per_page: 100,
            },
        );

        debug(`${commits.length} commit(s) in the pull request`);

        let autosquashCommits = 0;
        let mergeCommits = 0;
        for (const { commit: { message }, sha, url, parents } of commits) {
            const isAutosquash = message.startsWith("fixup!") || message.startsWith("squash!");
            const isMergeCommit = parents.length > 1;

            if (isAutosquash) {
                error(`Commit ${sha} is an autosquash commit: ${url}`);

                autosquashCommits++;
            }
            if (isMergeCommit) {
                error(`Commit ${sha} is an merge commit: ${url}`);

                mergeCommits++;
            }
        }

        if (autosquashCommits || mergeCommits) {
            throw Error(`PR requires a rebase. Found ${autosquashCommits} commit(s) that need to be squashed and/or ${mergeCommits} merge commits.`);
        }
    }
}

module.exports = PullRequestChecker;
