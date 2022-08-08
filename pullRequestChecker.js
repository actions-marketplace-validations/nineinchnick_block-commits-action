const { debug, error } = require("@actions/core");
const {
    context,
    getOctokit,
} = require("@actions/github");

class PullRequestChecker {
    constructor(repoToken, checkMerge, checkFixup) {
        this.client = getOctokit(repoToken);
        this.checkMerge = checkMerge;
        this.checkFixup = checkFixup;
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

            if (this.checkFixup && isAutosquash) {
                error(`Commit ${sha} is an autosquash commit: ${url}`);

                autosquashCommits++;
            }
            if (this.checkMerge && isMergeCommit) {
                error(`Commit ${sha} is an merge commit: ${url}`);

                mergeCommits++;
            }
        }
        let errors = []
        if (autosquashCommits) {
            errors.push(`${autosquashCommits} commit(s) that need to be squashed`);
        }
        if (mergeCommits) {
            errors.push(`${mergeCommits} merge commits.`);
        }
        if (errors) {
            throw Error("PR requires a rebase. Found: " + errors.join(", ") + ".");
        }
    }
}

module.exports = PullRequestChecker;
