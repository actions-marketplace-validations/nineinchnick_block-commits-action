const { getBooleanInput, getInput, setFailed } = require("@actions/core");

const PullRequestChecker = require("./pullRequestChecker");

async function run() {
    try {
        await new PullRequestChecker(
            getInput("repo-token", { required: true }),
            getBooleanInput("check-merge"),
            getBooleanInput("check-fixup"),
        ).process();
    } catch (error) {
        setFailed(error.message);
    }
}

run();
