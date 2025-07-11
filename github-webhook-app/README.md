# GitHub Webhook App

This project is a Node.js application that listens for GitHub webhook events, specifically for pull requests. It processes the incoming events, retrieves relevant information, and interacts with the GitHub API to comment on and approve or disapprove pull requests based on custom logic.

## Features

- ✅ Listens for GitHub webhook events with signature verification
- ✅ Processes pull request events (opened and synchronize actions)
- ✅ Fetches PR details, commits, and file changes from GitHub API
- ✅ Calls a custom review method to determine response
- ✅ Automatically comments on PRs and approves/disapproves based on response
- ✅ Proper error handling and logging

## Recent Fixes Applied

- Fixed module system consistency (all files now use CommonJS)
- Implemented proper signature verification for webhook security
- Added missing GitHub API methods (comment, approve, disapprove)
- Fixed parameter consistency across services
- Added proper GitHub App authentication
- Improved error handling and event filtering
- Updated environment variable configuration

## Project Structure

```
github-webhook-app
├── src
│   ├── app.js                # Entry point of the application
│   ├── controllers
│   │   └── webhookController.js # Handles incoming webhook events
│   ├── services
│   │   ├── githubService.js   # Interacts with the GitHub API
│   │   └── reviewService.js    # Processes pull request reviews
│   ├── middleware
│   │   └── auth.js            # Authentication middleware
│   └── utils
│       └── crypto.js          # Utility functions for cryptographic operations
├── package.json               # npm configuration file
├── .env.example               # Example environment variables
├── .gitignore                 # Files and directories to ignore by Git
└── README.md                  # Documentation for the project
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/github-webhook-app.git
   cd github-webhook-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables, including your GitHub app credentials and webhook secret.

4. Start the application:
   ```
   npm start
   ```

## Usage

- Set up a GitHub App and configure it to send webhook events to your application's endpoint.
- The application will listen for pull request events and process them according to the defined logic.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.