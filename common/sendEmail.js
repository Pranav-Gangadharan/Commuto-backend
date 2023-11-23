import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from './index.js';
import PasswordReset from '../models/passwordReset.js';

dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASSWORD,
  }
});


export const resetPasswordLink = async (user, res) => {
  const { _id, email, firstName } = user;

  const token = _id + uuidv4();

  const link = `${APP_URL}/users/reset-password/${_id}/${token}`;

  let mailOptions = {
    from: AUTH_EMAIL,
    to: email,
    subject: 'Password Reset',
    html: `<div>
    <h3>Hi ${firstName},</h3>
    <p>Password reset link, please click the link below to reset passsword. </p> <br>
    <p>This Line <b>expires in 10 Mins</b></p>
    <br>
    <a href=${link} style="color:#fff; padding:14px; text-decoration:none;background-color:#000;">Click Here To Verify</a>
    <br>
    <div style="align-items:center; margin-top:10px;">
    <h3>Best Regards</h3>
    <h4>Commuto</h4>
    </div>
      </div>`,
  };

  try {

    const hashedToken = await hashPassword(token);

    const resetEmail = await PasswordReset.create({
      userId: _id,
      email: email,
      token: hashedToken,
      createAt: Date.now(),
      expiresAt: Date.now() + 600000,
    });


    if (resetEmail) {
      transporter.sendMail(mailOptions).then(() => {
        res.status(201).send({
          success: "Pending",
          message: "Reset password link has been send to your accound. Check your email for link"
        });
      }).catch((err) => {
        console.log(err);
        res.status(404).json({ message: "Something went wrong" });
      });
    }
  } catch (error) {

  }
};