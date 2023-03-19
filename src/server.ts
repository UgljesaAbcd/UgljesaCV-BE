import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import cors from 'cors';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './router/routes';

const options: ConnectOptions = {
  dbName: 'mycvdb',
  user: '',
  pass: ''
};

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(routes);

const PORT = process.env.PORT || 5001;
const MONGO_URL = process.env.MONGODB_URL;

mongoose
  .connect(MONGO_URL, options)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('Failed to connect to MongoDB:', err);
  });
