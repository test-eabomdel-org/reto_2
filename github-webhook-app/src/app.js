require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const WebhookController = require('./controllers/webhookController');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Create controller instance
const webhookController = new WebhookController();

// Middleware
app.use(bodyParser.json());
app.use(authMiddleware);

// Routes
app.post('/webhook', (req, res) => webhookController.handleWebhook(req, res));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});