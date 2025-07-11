
module.exports = (req, res, next) => {
    // Skip all verification for development/testing
    console.log('⚠️  Webhook verification DISABLED - Development mode only');
    console.log(`📥 Received webhook from: ${req.headers['user-agent'] || 'Unknown'}`);
    next();
};