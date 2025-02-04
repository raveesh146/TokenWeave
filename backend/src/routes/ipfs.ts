import express from "express";
import { processProductData } from "../server";

const router = express.Router();

router.post("/store", async (req, res) => {
  const { productData } = req.body;

  if (!productData) {
    return res.status(400).json({ error: "Product data is required" });
  }

  const ipfsLink = await processProductData(productData);
  res.json({ ipfsLink });
});

export default router;
