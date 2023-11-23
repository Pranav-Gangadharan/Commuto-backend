import { createJWT, hashCompare, hashPassword } from '../common/index.js';
import Users from '../models/userModel.js';


export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!(firstName || lastName || email || password)) {
    next("Provide required fields");
    returnl;
  }
  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      next("Email already exists");
      return;
    }

    const hashedPassword = await hashPassword(password);


    const user = await Users.create({
      firstName, lastName, email, password: hashedPassword
    });




  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      next("Please provide user credential");
      return;
    }

    const user = await Users.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password",
    });

    if (!user) {
      next("Invalid email or password");
      return;
    }

    const isMatch = await hashCompare(password, user?.password);

    if (!isMatch) {
      next("Invaild email or Password");
      return;
    }


    user.password = undefined;

    const token = createJWT(user?._id);

    res.status(201).json({
      succes: true,
      message: "Login successfully",
      user,
      token,
    });


  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};