import { Router } from 'express';
const routes = Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

routes.post('/user', (req, res) => {
  return res.json({ message: 'Hello World' });
});

export default routes;

// db.createUser({ user: "jamesbond", pwd: "bondjamsesbond", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
