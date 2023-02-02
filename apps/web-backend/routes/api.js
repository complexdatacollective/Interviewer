import { Router } from 'express';
import checkAdminAuth from '../middleware/checkAdminAuth.js';
import checkDBReady from '../middleware/checkDbReady.js';
import { getSecureDb } from '../storage/secure.js';


const apiRouter = Router();

// Mock protocol data (for now)
// TODO: create a function to generate mock protocols
const protocols = [
  {
    id: '1',
    name: 'Protocol 1',
  },
  {
    id: '2',
    name: 'Protocol 2',
  },
]

// apiRouter.use('/api', checkDBReady); // All API routes require the database to be unlocked
// apiRouter.use('/api/secure', checkAdminAuth); // Admin routes require an admin JWT

// List all participants
apiRouter.get('/api/protocols', (req, res) => {
  res.send(protocols);
});

// Create a new participant using dynamic route
apiRouter.post('/api/protocols', async (req, res) => {
  const { id, name } = req.body;
  console.log(req.body);
  protocols.push({ id, name });



  res.send({ status: 'ok' });
});

export default apiRouter;