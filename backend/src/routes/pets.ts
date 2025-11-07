import express from 'express';
import * as petController from '../controllers/petController';

const router = express.Router();

router.get('/', petController.getAllPets);

router.get('/:id', petController.getPetById);

router.post('/', petController.createPet);

router.patch('/:id', petController.updatePet);

router.delete('/:id', petController.deletePet);

export default router;

