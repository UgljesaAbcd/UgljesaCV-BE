import { Request, Response } from 'express';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import UserModel, { IUser, IMessage } from '../db/models/user';
import { REST_STATUS_CODES } from '../utils/constants';

const activationLinkAddress = 'http://localhost:5001/user/activate/';
const frontendApp = 'http://localhost:3000';

export const activateUser = async (req: Request, res: Response) => {
  const { email } = req.params;

  await UserModel.findOneAndUpdate(
    { email },
    { $set: { activate: true } },
    { new: true }
  )
    .then(updatedUser => {
      res.set('Content-Type', 'text/html');
      res.send(
        Buffer.from(
          `<div><p>Thanks for activation of the account. You can login now.</p><a href="${frontendApp}"><button style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Go to LOGIN</button></a></div>`
        )
      );
    })
    .catch(err => {
      res.set('Content-Type', 'text/html');
      res.send(
        Buffer.from(
          '<p>Activation failed. Please send email to vojvodicugljesa@gmail.com</p>'
        )
      );
    });
};

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
    activate: false,
    theme: 'light',
    messages,
    password: hash
  };

  const newUser = new UserModel(user);
  newUser
    .save()
    .then(async createdUser => {
      try {
        let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'citropucko@gmail.com',
            pass: 'mbwxnhovekwqgxvs'
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        let mailOptions = {
          from: '"Ugljesa" <citropucko@gmail.com>', // sender address
          to: email, // list of receivers
          subject: 'Activate your account', // Subject line
          html: `<p>Thank you for signing up for my CV. Please click the button below to activate your account:</p><br><a href="${activationLinkAddress}${email}"><button style="background-color: #4CAF50; border: none; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Activate Account</button></a>` // HTML body
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Message sent: %s', info.messageId);
          }
        });
      } catch (globErr) {
        res.status(REST_STATUS_CODES.INTERNAL_SERVER_ERROR).send(globErr);
      }

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
