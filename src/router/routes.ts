import { Router, Request, Response } from 'express';
import UserModel, { IUser } from '../db/models/user';
import { createUser, loginUser, checkUserToken } from '../controllers/user';
const routes = Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

routes.post('/user/register', createUser);
routes.post('/user/login', loginUser);
routes.post('/user/decoded', checkUserToken);

export default routes;
