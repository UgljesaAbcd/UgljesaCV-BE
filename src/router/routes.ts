import { Router } from 'express';
import {
  createUser,
  loginUser,
  checkUserToken,
  activateUser
} from '../controllers/user';
const routes = Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

routes.post('/user/register', createUser);
routes.post('/user/login', loginUser);
routes.post('/user/decoded', checkUserToken);
routes.get('/user/activate/:email', activateUser);

export default routes;
