import express from "express";
import agentRoutes from "./routes/agent";
import ipfsRoutes from "./routes/ipfs";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/agent", agentRoutes);
app.use("/ipfs", ipfsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
