const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const path = require('path');
const mongoose = require('mongoose'); // Import Mongoose

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MongoDB connection (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/snapshotsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Define Mongoose schema and model
const snapshotSchema = new mongoose.Schema({
    url: String,
    date: { type: Date, default: Date.now }
});

const Snapshot = mongoose.model('Snapshot', snapshotSchema);

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'abc', // Replace with your Cloudinary cloud name
    api_key: 'abc', // Replace with your Cloudinary API key
    api_secret: 'abc', // Replace with your Cloudinary API secret
});

// Set up EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to serve the video stream page
app.get('/index', (req, res) => {
    res.render('index', { serverIp: 'your-laptop-ip' }); // Replace 'your-laptop-ip'
});

app.get('/', (req, res) => {
    res.render('home'); // Replace 'your-laptop-ip'
});

// Serve static files (optional if needed for CSS/JS)
app.use(express.static('public'));

// Set up WebSocket communication for video streaming
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message); // Broadcast to all connected clients
            }
        });
    });
});

// Handle snapshot uploads and save to Cloudinary
app.post('/snapshot', (req, res) => {
    const upload = multer().single('image'); // Use multer to handle the image upload
    
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Image upload failed');
        }
        
        try {
            // Upload image to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    resource_type: 'image',
                    folder: 'thermal_snapshots', // Optional: specify folder name
                    public_id: `snapshot_${Date.now()}`, // Optional: custom public ID
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                
                stream.end(req.file.buffer); // Write image data to the stream
            });
            
            // Save URL and timestamp to MongoDB
            const snapshot = new Snapshot({
                url: result.secure_url,
                date: new Date() // Automatically gets the current date and time
            });

            await snapshot.save(); // Save to database
            console.log(`Snapshot saved to MongoDB with URL: ${result.secure_url}`);
            
            res.status(200).send(`Snapshot received and saved: ${result.secure_url}`);
        } catch (error) {
            console.error('Error uploading to Cloudinary or saving to MongoDB:', error);
            res.status(500).send('Failed to upload snapshot and save data');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/eg",(req,res)=>{
    res.send("root is working");
});
