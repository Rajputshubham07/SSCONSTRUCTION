const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure messages file exists
if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

// Endpoint to receive enquiries
app.post('/api/enquiries', (req, res) => {
    try {
        const newEnquiry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...req.body
        };

        // Read existing messages
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(data);

        // Add new message
        messages.push(newEnquiry);

        // Save updated messages
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        res.status(201).json({ success: true, message: 'Enquiry received successfully' });
    } catch (error) {
        console.error('Error saving enquiry:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Endpoint to view enquiries (Raw JSON)
app.get('/api/enquiries', (req, res) => {
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(data);
        res.json(messages);
    } catch (error) {
        console.error('Error reading enquiries:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Admin Dashboard to view enquiries beautifully
app.get('/admin', (req, res) => {
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(data);
        
        let messagesHtml = messages.reverse().map(msg => `
            <div class="message-card">
                <div class="message-header">
                    <h3>${msg.name}</h3>
                    <span class="service-badge">${msg.service}</span>
                </div>
                <div class="message-contact">
                    <p>📧 ${msg.email}</p>
                    <p>📱 ${msg.phone}</p>
                    <p>🕒 ${new Date(msg.timestamp).toLocaleString()}</p>
                </div>
                <div class="message-body">
                    <p>${msg.message}</p>
                </div>
            </div>
        `).join('');

        if (messages.length === 0) {
            messagesHtml = '<p class="empty-state">No enquiries received yet.</p>';
        }

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Enquiries Dashboard</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f4f7f6;
                        color: #333;
                        margin: 0;
                        padding: 40px 20px;
                    }
                    .container {
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    h1 {
                        text-align: center;
                        color: #1a2a3a;
                        margin-bottom: 40px;
                        font-size: 2.5rem;
                    }
                    .messages-grid {
                        display: grid;
                        gap: 20px;
                    }
                    .message-card {
                        background: #fff;
                        border-radius: 10px;
                        padding: 25px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                        border-left: 5px solid #f5a623;
                    }
                    .message-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                    }
                    .message-header h3 {
                        margin: 0;
                        font-size: 1.4rem;
                        color: #1a2a3a;
                    }
                    .service-badge {
                        background: #1a2a3a;
                        color: #f5a623;
                        padding: 5px 12px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: bold;
                        text-transform: capitalize;
                    }
                    .message-contact {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin-bottom: 15px;
                        color: #666;
                        font-size: 0.95rem;
                    }
                    .message-contact p {
                        margin: 0;
                        background: #f8f9fa;
                        padding: 6px 12px;
                        border-radius: 6px;
                    }
                    .message-body {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        line-height: 1.6;
                        color: #444;
                    }
                    .message-body p {
                        margin: 0;
                        white-space: pre-wrap;
                    }
                    .empty-state {
                        text-align: center;
                        font-size: 1.2rem;
                        color: #777;
                        margin-top: 50px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📬 Enquiries Dashboard</h1>
                    <div class="messages-grid">
                        ${messagesHtml}
                    </div>
                </div>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
