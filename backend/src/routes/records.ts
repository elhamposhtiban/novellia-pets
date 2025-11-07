import express from 'express';
import * as recordController from '../controllers/recordController';

const router = express.Router();

router.get('/pet/:petId', recordController.getRecordsByPetId);

router.get('/:id', recordController.getRecordById);

router.post('/pet/:petId', recordController.createRecord);

router.patch('/:id', recordController.updateRecord);

router.delete('/:id', recordController.deleteRecord);

export default router;

