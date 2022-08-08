const { info } = require("@actions/core");
const {
    context,
    getOctokit,
} = require("@actions/github");

class PullRequestChecker {
    constructor(repoToken, actionMerge, actionFixup) {
        this.client = getOctokit(repoToken);
        this.actionMerge = actionMerge;
        this.actionFixup = actionFixup;
    }

    async process() {
        const listArgs = {
            ...context.repo,
            pull_number: context.issue.number,
            per_page: 100,
        };
        const commits = await this.client.paginate(this.client.rest.pulls.listCommits.endpoint.merge(listArgs));

        info(`Action for fixup commits: ${this.actionFixup}`);
        info(`Action for merge commits: ${this.actionMerge}`);
        info(`${commits.length} commit(s) in the pull request`);

        let autosquashCommits = 0;
        let mergeCommits = 0;
        for (const { commit: { message }, sha, url, parents } of commits) {
            const isAutosquash = message.startsWith("fixup!") || message.startsWith("squash!");
            const isMergeCommit = parents.length > 1;

            if (this.actionFixup != "none" && isAutosquash) {
                info(`Commit ${sha} is an autosquash commit: ${url}`);

                autosquashCommits++;
            }
            if (this.actionMerge != "none" && isMergeCommit) {
                info(`Commit ${sha} is an merge commit: ${url}`);

                mergeCommits++;
            }
        }
        let reviewMessages = [];
        let failMessages = [];
        if (autosquashCommits) {
            let message = `${autosquashCommits} commit(s) that need to be squashed`;
            if (this.actionFixup == "request-changes") {
                reviewMessages.push(message);
            }
            if (this.actionFixup == "fail") {
                failMessages.push(message);
            }
        }
        if (mergeCommits) {
            let message = `${mergeCommits} merge commits`;
            if (this.actionMerge == "request-changes") {
                reviewMessages.push(message);
            }
            if (this.actionMerge == "fail") {
                failMessages.push(message);
            }
        }
        if (this.actionFixup == "request-changes" || this.actionMerge == "request-changes") {
            let okMessage = "PR no longer has any merge or fixup commits.";
            let failPrefix = "PR requires a rebase. Found: ";
            let state = "APPROVED";
            let event = "APPROVE";
            let body = okMessage;
            if (reviewMessages.length != 0) {
                state = "CHANGES_REQUESTED";
                event = "REQUEST_CHANGES";
                body = failPrefix + reviewMessages.join(", ") + ".";
            }
            const reviews = await this.client.paginate(this.client.rest.pulls.listReviews.endpoint.merge(listArgs))
            const [latest] = reviews.filter((review) => review.user.type === "Bot" && (review.body === okMessage || review.body.startsWith(failPrefix))).slice(-1)
            if ((!latest && reviewMessages.length != 0) || (latest && latest.state != state)) {
                this.client.rest.pulls.createReview({
                    ...context.repo,
                    pull_number: context.issue.number,
                    body: body,
                    event: event,
                });
            }
        }
        if (failMessages.length != 0) {
            throw Error("PR requires a rebase. Found: " + failMessages.join(", ") + ".");
        }
    }
}

module.exports = PullRequestChecker;
