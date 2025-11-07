import express from 'express';
import * as recordController from '../controllers/recordController';

const router = express.Router();

// Get all medical records for a specific pet
router.get('/pet/:petId', recordController.getRecordsByPetId);

// Get single medical record by ID
router.get('/:id', recordController.getRecordById);

// Create medical record for a pet
router.post('/pet/:petId', recordController.createRecord);

// Update medical record
router.put('/:id', recordController.updateRecord);

// Delete medical record
router.delete('/:id', recordController.deleteRecord);

export default router;

