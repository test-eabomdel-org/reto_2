const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class GitHubService {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.appId = process.env.GITHUB_APP_ID;
        this.privateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH;
        this.installationId = process.env.GITHUB_INSTALLATION_ID;
        
        // Read the private key file
        this.privateKey = fs.readFileSync(path.resolve(this.privateKeyPath), 'utf8');
        
        this.axios = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Webhook-App'
            }
        });
    }

    // Generate JWT token for GitHub App authentication
    generateJWT() {
        const payload = {
            iat: Math.floor(Date.now() / 1000) - 60, // Issued at time, 60 seconds in the past
            exp: Math.floor(Date.now() / 1000) + (10 * 60), // Expires in 10 minutes
            iss: this.appId // GitHub App ID
        };
        
        return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
    }

    // Get installation access token
    async getInstallationToken() {
        const jwtToken = this.generateJWT();
        
        const response = await axios.post(
            `${this.baseURL}/app/installations/${this.installationId}/access_tokens`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Webhook-App'
                }
            }
        );
        
        return response.data.token;
    }

    // Set authorization header with fresh token
    async setAuthHeader() {
        const token = await this.getInstallationToken();
        this.axios.defaults.headers['Authorization'] = `token ${token}`;
    }

    async getPullRequestDetails(owner, repo, pullNumber) {
        await this.setAuthHeader();
        const response = await this.axios.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
        return response.data;
    }

    async getPullRequestCommits(owner, repo, pullNumber) {
        await this.setAuthHeader();
        const response = await this.axios.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/commits`);
        return response.data;
    }

    async getPullRequestChanges(owner, repo, pullNumber) {
        await this.setAuthHeader();
        const response = await this.axios.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/files`);
        return response.data;
    }

    async commentOnPullRequest(owner, repo, pullNumber, comment) {
        await this.setAuthHeader();
        const response = await this.axios.post(`/repos/${owner}/${repo}/issues/${pullNumber}/comments`, {
            body: comment
        });
        return response.data;
    }

    async approvePullRequest(owner, repo, pullNumber) {
        await this.setAuthHeader();
        const response = await this.axios.post(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
            event: 'APPROVE',
            body: 'Pull request approved by automated review'
        });
        return response.data;
    }

    async disapprovePullRequest(owner, repo, pullNumber) {
        await this.setAuthHeader();
        const response = await this.axios.post(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
            event: 'REQUEST_CHANGES',
            body: 'Pull request requires changes based on automated review'
        });
        return response.data;
    }
}

module.exports = GitHubService;