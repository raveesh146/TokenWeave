const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes');
const { initializeCdpAgent } = require('./services/cdpAgent');

dotenv.config();

const app = express();
app.use(express.json());

// Initialize the CDP agent
let cdpAgent;
initializeCdpAgent().then(agent => {
  cdpAgent = agent;
  global.cdpAgent = agent; // Make agent globally available
}).catch(console.error);

// Routes
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 