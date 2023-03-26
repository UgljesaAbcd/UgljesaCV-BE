import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel, { IUser } from '../db/models/user';
import { REST_STATUS_CODES } from '../utils/constants';

export const checkUserToken = async (req: Request, res: Response) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  res.status(REST_STATUS_CODES.OK).json(decoded);
};

export const loginUser = async (req: Request, res: Response) => {
  const { password, email } = req.body;

  const dbUser = await UserModel.findOne({ email });
  if (dbUser?.email) {
    const isValid = bcrypt.compareSync(password, dbUser.password);

    if (isValid) {
      const user: IUser = {
        ...req.body
      };
      const token = jwt.sign(
        {
          email: dbUser.email,
          password
        },
        process.env.JWT_SECRET
      );
      res.status(REST_STATUS_CODES.OK).json({
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        company: dbUser.company,
        theme: dbUser.theme,
        token: token
      });
    } else {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }
  } else {
    res.status(REST_STATUS_CODES.NO_CONTENT).json({ err: 'User not found' });
  }
};

export const createUser = (req: Request, res: Response) => {
  const {
    password,
    email,
    firstName,
    lastName,
    company,
    activate,
    theme,
    messages
  } = req.body;

  const salt = bcrypt.genSaltSync(10);
  // const salt = '$2b$10$NMN/vnk0ypMDUqDYM6lIH.';
  const hash = bcrypt.hashSync(password, salt);
  const user = {
    email,
    firstName,
    lastName,
    company,
    activate,
    theme,
    messages,
    password: hash
  };
  const newUser = new UserModel(user);
  newUser
    .save()
    .then(createdUser => {
      res.status(REST_STATUS_CODES.CREATED).json({
        id: createdUser._id,
        email,
        firstName,
        lastName,
        company,
        activate,
        theme: 'light',
        messages: []
      });
    })
    .catch(err => {
      res.status(REST_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err);
    });
};
