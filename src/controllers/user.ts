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
  const user: IUser = {
    ...req.body
  };

  const dbUser = await UserModel.findOne({ email });
  if (dbUser?.email) {
    bcrypt
      .hash(password, 10)
      .then(hash => {
        validateUser(hash);
      })
      .catch(err => {
        res.status(REST_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err);
      });

    function validateUser(hash: string) {
      bcrypt
        .compare(dbUser.password, hash)
        .then(() => {
          const token = jwt.sign(user, process.env.JWT_SECRET);
          res.status(REST_STATUS_CODES.OK).json({
            email: dbUser.email,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            company: dbUser.company,
            theme: dbUser.theme,
            token: token
          });
        })
        .catch(err => {
          res.status(REST_STATUS_CODES.INTERNAL_SERVER_ERROR).json(err);
        });
    }
  } else {
    res.status(REST_STATUS_CODES.NO_CONTENT).json({ err: 'User not found' });
  }
};

export const createUser = async (req: Request, res: Response) => {
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

  bcrypt
    .genSalt(10)
    .then(salt => {
      return bcrypt.hash(password, salt);
    })
    .then(hash => {
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
          res.status(REST_STATUS_CODES.CREATED).json(createdUser);
        })
        .catch(err => {
          res.status(REST_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err);
        });
    })
    .catch(err => {
      res.status(REST_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err);
    });
};
