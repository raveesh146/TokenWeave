import app from './app';
import { config } from './config/env';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Network: ${config.NETWORK_ID}`);
}); 