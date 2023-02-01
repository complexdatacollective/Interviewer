import { Router } from 'express';
import checkAdminAuth from '../middleware/checkAdminAuth.js';
import checkDBReady from '../middleware/checkDbReady.js';
import { getSecureDb } from '../storage/secure.js';


const apiRouter = Router();

apiRouter.use('/api', checkDBReady); // All API routes require the database to be unlocked
apiRouter.use('/api/secure', checkAdminAuth); // Admin routes require an admin JWT

// List all participants
apiRouter.get('/api/participants', (req, res) => {
  const secureDb = getSecureDb();
  console.log(secureDb.data);
  res.send(secureDb.data.participants);
});

// Create a new participant using dynamic route
apiRouter.post('/api/participants/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.status(400).send({ error: 'Name is required' });
    return;
  }

  const participant = {
    id,
    name,
    sessions: [],
  };

  const secureDb = getSecureDb();

  secureDb.data.participants.push(participant);
  await secureDb.write();
  res.send(participant);
});

export default apiRouter;