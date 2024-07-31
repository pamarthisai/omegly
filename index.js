import helmet from 'helmet';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 8080;

// Resolve directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use security and performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve landing page at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Previously 'landing.html'
});

// Serve main page
app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html')); // Previously 'index.html'
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
