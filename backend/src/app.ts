import express from 'express';
import rateLimit from 'express-rate-limit';
import { MemeCoinController } from './controllers/memeCoin.controller';

const app = express();

// Adjust the rate limiter to be more conservative
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create a specific limiter for the meme coin endpoint
const memeCoinLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: 'Too many meme coin generation requests, please try again later.'
});

app.use(express.json());
app.use(limiter); // Global rate limiting

const memeCoinController = new MemeCoinController();

// Apply specific rate limiting to the meme coin endpoint
app.post('/generate-meme-coin', 
  memeCoinLimiter,
  (req, res) => memeCoinController.generateMemeCoin(req, res)
);

export default app; 