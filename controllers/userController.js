import Users from '../models/userModel.js';
import PasswordReset from '../models/passwordReset.js';
import { resetPasswordLink } from '../common/sendEmail.js';
import { createJWT, hashCompare, hashPassword } from '../common/index.js';
import FriendRequest from '../models/FriendRequest.js';

import dotenv from 'dotenv';

dotenv.config();

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "Email address is not found",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "pending",
          messsage: "Reset password link is already been send",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }

    await resetPasswordLink(user, res);

  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: `User does not exists`,
      });
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      return res.status(404).json({
        status: `Invalid password reset link. Try again`,
      });
    }

    const { expiresAt, token: resetToken } = resetPassword;

    if (expiresAt < Date.now()) {
      res.status(404).json({
        status: `Reset password link has been expired. Try again`,
      });
    }

    const isMatch = await hashCompare(token, resetToken);

    if (!isMatch) {
      res.send('Link Expired');
    } else {
      res.render("index", { email: user.email, status: "Not verified" });

    }

  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (res, req) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = await Users.findOne({ _id: id });

    if (!user) {
      return res.status(404).send({ message: 'User not exists' });
    }

    await Users.updateOne({
      _id: id,
    }, {
      $set: {
        password: hashedPassword
      }
    });

    res.render("index", { email: user.email, status: "verified" });

  } catch (error) {
    console.log(error);
    res.send({ message: error.message });
  }
};

export const getUser = async (req, res, next) => {

  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const user = await Users.findById(id ?? userId).populate({
      path: "friends",
      select: "-password",
    });

    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    }


    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message
    });
  }
};


export const updateUser = async (req, res, next) => {
  try {

    const { firstName, lastName, location, profileUrl, profession } = req.body;
    if (!(firstName || lastName || contact || location || profession)) {
      next("Please provide all required fields");
      return;
    }

    const { userId } = req.body.user;

    const updateUser = {
      firstName, lastName, location, profileUrl, profession, _id: userId
    };

    const user = await Users.findByIdAndUpdate(userId, updateUser, {
      new: true,
    });


    await user.populate({ path: "friends", select: "-password" });
    const token = createJWT(user?._id);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      token,
    });


  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const friendRequest = async (req, res, next) => {


  try {
    const { userId } = req.body.user;
    const { requestTo } = req.body;

    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      next("Friend request already send");
      return;
    }

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId
    });

    if (accountExist) {
      next("Friend Request already send");
      return;
    }

    const newRes = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    });

    res.status(201).json({
      success: true,
      message: "Friend Request send successfully",
    });



  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }


};


export const getFriendRequest = async (req, res, next) => {

  try {
    const { userId } = req.body.user;

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    }).populate({
      path: "requestFrom",
      select: "firstName lastName profileUrl profession -password"
    }).limit(10).sort({
      _id: -1
    });

    res.status(200).json({
      success: true,
      data: request,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};


export const acceptRequest = async (req, res, next) => {


  try {
    const id = req.body.user.userId;

    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next("No friend request found");
      return;

    }

    const newRes = await FriendRequest.findByIdAndUpdate({
      _id: rid
    }, { requestStatus: status });

    if (status === "Accepted") {
      const user = await Users.findById(id);

      user.friends.push(newRes?.requestTo);

      await user.save();

      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: "Friend request" + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });

  }
};

export const profileViews = async (req, res, next) => {

  try {
    const { userId } = req.body.user;
    const { id } = req.body;
    const user = await Users.findById(id);

    user.views.push(userId);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {

  }
};

export const suggestedFriends = async (req, res, next) => {

  try {
    const { userId } = req.body.user;

    let queryObject = {};

    queryObject._id = { $ne: userId };

    queryObject.friends = { $nin: userId };

    let queryResult = Users.find(queryObject).limit(15).select("firstName lastName profileUrl profession -password");

    const suggestedFriends = await queryResult;

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};



