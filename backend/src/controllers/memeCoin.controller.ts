import { Request, Response } from 'express';
import { MemeCoinService } from '../services/memeCoin.service';
import { validateInput } from '../utils/validation';

export class MemeCoinController {
  async generateMemeCoin(req: Request, res: Response) {
    try {
      // Validate input
      const validationError = validateInput(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const memeCoinService = await MemeCoinService.getInstance();
      const result = await memeCoinService.generateMemeCoin(req.body);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Controller error:', error);
      return res.status(500).json({
        error: 'Failed to generate meme coin',
        details: error.message
      });
    }
  }
} 