import express from 'express';
import petRoutes from './pets';
import recordRoutes from './records';
import dashboardRoutes from './dashboard';

const router = express.Router();

router.use('/pets', petRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;

