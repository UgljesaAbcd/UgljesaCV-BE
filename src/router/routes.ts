import { Router, Request, Response } from 'express';
import UserModel, { IUser } from '../db/models/user';
const routes = Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

routes.post('/user', async (req: Request, res: Response) => {
  const user: IUser = {
    ...req.body
  };

  const newUser = new UserModel(user);
  newUser
    .save()
    .then(createdUser => {
      res.status(200).json(createdUser);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

export default routes;

// db.createUser({ user: "jamesbond", pwd: "bondjamsesbond", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
