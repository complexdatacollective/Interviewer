import { Router } from 'express';
import { initController, unlockController } from '../controllers/database.js';

const databaseRouter = Router();

// Initialization route creates a new encrypted database
databaseRouter.post('/database/initialize', initController);

// Unlock route unlocks the database
databaseRouter.post('/database/unlock', unlockController);

export default databaseRouter;