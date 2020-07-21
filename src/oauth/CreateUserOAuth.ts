import User from "../entity/User";
import { v4 } from "uuid";
import { Request } from "express";

export const createFacebookUser = async (_req: Request, profile: any): Promise<number> => {
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
  
  // Returns UserID
  return user.id;
};

export const createGoogleUser = async (_req: Request, profile: any): Promise<number> => {
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
  
  // Returns UserID
  return user.id;
};
