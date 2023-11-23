import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (useValue) => {
  let salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  let hashedpassword = await bcrypt.hash(useValue, salt);
  return hashedpassword;
};

export const hashCompare = async (userPassword, password) => {
  const isMatch = await bcrypt.compare(userPassword, password);
  return isMatch;
};


export function createJWT(id) {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "10m",
  });
}

