const GitHubService = require('../services/githubService');
const ReviewService = require('../services/reviewService');

class WebhookController {
    constructor() {
        this.githubService = new GitHubService();
        this.reviewService = new ReviewService();
    }

    async handleWebhook(req, res) {
        const event = req.headers['x-github-event'];
        const action = req.body.action;
        
        // Only process opened or synchronized pull requests
        if (event === 'pull_request' && (action === 'opened' || action === 'synchronize')) {
            const pullRequestData = req.body;
            const prNumber = pullRequestData.number;
            const owner = pullRequestData.repository.owner.login;
            const repo = pullRequestData.repository.name;

            try {
                const prDetails = await this.githubService.getPullRequestDetails(owner, repo, prNumber);
                const commits = await this.githubService.getPullRequestCommits(owner, repo, prNumber);
                const changes = await this.githubService.getPullRequestChanges(owner, repo, prNumber);

                const responseString = await this.reviewService.processReview(prDetails, commits, changes);
                
                await this.githubService.commentOnPullRequest(owner, repo, prNumber, responseString);
                
                if (responseString.includes('approve')) {
                    await this.githubService.approvePullRequest(owner, repo, prNumber);
                } else {
                    await this.githubService.disapprovePullRequest(owner, repo, prNumber);
                }

                res.status(200).send('Webhook processed successfully');
            } catch (error) {
                console.error('Error processing webhook:', error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.status(200).send('Event not processed');
        }
    }
}

module.exports = WebhookController;