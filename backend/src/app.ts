import express from 'express';
import rateLimit from 'express-rate-limit';
import { MemeCoinController } from './controllers/memeCoin.controller';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins i guess
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(express.json());
app.use(limiter);

const memeCoinController = new MemeCoinController();


app.post('/generate-meme-coin', 
  (req, res) => memeCoinController.generateMemeCoin(req, res)
);

export default app; 