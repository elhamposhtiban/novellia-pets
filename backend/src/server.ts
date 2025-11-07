import express from 'express';
import cors from 'cors';
import { connect, initializeSchema } from './db/database';
import { config } from './config/config';
import routes from './routes';

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

(async () => {
  try {
    await connect();
    
    await initializeSchema();
    
    console.log('✅ Database setup complete');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database setup failed:', err);
    process.exit(1);
  }
})();

