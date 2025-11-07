import express from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', dashboardController.getStats);

export default router;

