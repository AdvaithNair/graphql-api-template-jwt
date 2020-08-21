import User from "../entities/User";
import { v4 } from "uuid";
import { Response } from "express";
import { setTokens } from "../utils/Token";

export const createFacebookUser = async (res: Response, profile: any): Promise<number> => {
  const profilePicture: string = `http://graph.facebook.com/${profile.id}/picture?type=large`;

  // Enters User into Table if it Doesn't Exist
  let user = await User.findOne({ email: profile._json.email });
  if (!user) {
    user = await User.create({
      email: profile._json.email,
      password: undefined,
      username: v4(),
      imageURL: profilePicture,
      confirmed: true
    }).save();
  }

  setTokens(res, user);
  
  // Returns UserID
  return user.id;
};

export const createGoogleUser = async (res: Response, profile: any): Promise<number> => {
  // Enters User into Table if it Doesn't Exist
  let user = await User.findOne({ email: profile._json.email });
  if (!user) {
    user = await User.create({
      email: profile._json.email,
      password: undefined,
      username: v4(),
      imageURL: profile._json.picture,
      confirmed: true
    }).save();
  }

  setTokens(res, user);
  
  // Returns UserID
  return user.id;
};
