const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the frontends directory
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Route for HTML pages
app.get('/*.html', (req, res) => {
    const fileName = req.params[0] + '.html';
    res.sendFile(path.join(__dirname, 'html', fileName));
});

// Route for CSS files
app.get('/css/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Route for JS files
app.get('/js/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Handle 404 - redirect to index
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`🚀 ServiceHub Frontend Server is running!`);
    console.log(`📍 Server Address: http://localhost:${PORT}`);
    console.log(`🔗 Backend API: http://localhost:8080`);
    console.log(`\n📄 Available Pages:`);
    console.log(`   • Home: http://localhost:${PORT}/`);
    console.log(`   • Customer Login: http://localhost:${PORT}/customer-login.html`);
    console.log(`   • Customer Register: http://localhost:${PORT}/customer-register.html`);
    console.log(`   • Worker Login: http://localhost:${PORT}/worker-login.html`);
    console.log(`   • Worker Register: http://localhost:${PORT}/worker-register.html`);
    console.log(`   • Browse Services: http://localhost:${PORT}/services.html`);
    console.log(`   • My Bookings: http://localhost:${PORT}/my-bookings.html`);
    console.log(`   • Backend Test: http://localhost:${PORT}/test-backend.html`);
    console.log(`\n⚡ Ready to serve your Blue Collar Worker Platform!`);
    console.log(`💡 Make sure your Spring Boot backend is running on port 8080`);
});