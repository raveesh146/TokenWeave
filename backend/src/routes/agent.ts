import express from "express";
import { scrapeProductData } from "../scraper";

const router = express.Router();

router.post("/scrape", async (req, res) => {
  const { productUrl } = req.body;

  if (!productUrl) {
    return res.status(400).json({ error: "Product URL is required" });
  }

  const data = await scrapeProductData(productUrl);
  res.json({ data });
});

export default router;
