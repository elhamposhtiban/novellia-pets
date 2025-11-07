import express, { Request, Response } from 'express';
import cors from 'cors';
import { connect, initializeSchema } from './db/database';
import { config } from './config/config';
import petRoutes from './routes/pets';
import recordRoutes from './routes/records';
import dashboardRoutes from './routes/dashboard';

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/pets', petRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

