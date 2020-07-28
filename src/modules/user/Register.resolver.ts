import { Resolver, Mutation, Arg } from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../../entity/User";
import RegisterInput from "./input/RegisterInput";
import sendEmail from "../utils/sendEmail";
import createLimitedURL from "../utils/createLimitedURL";
import redis from "../../redis";
import { EmailType } from "../../types";
import { REDIS_PREFIXES } from "../../secrets";

@Resolver()
export default class RegisterResolver {
  // Registers User
  // NOTE: Adjust to Prehash Password when implementing with frontend
  @Mutation(() => User, { description: "Registers User in User Table" })
  async register(@Arg("data")
  {
    email,
    password,
    username
  }: RegisterInput): Promise<User> {
    // Hashes Password for Entry in User Table
    const hashedPassword: string = await bcrypt.hash(password, 12); // Without Frontend
    // const hashedPassword: string = password; // With Frontend (Uncomment)

    // Enters User into Table
    const user = await User.create({
      email,
      password: hashedPassword,
      username
    }).save();

    // Creates Confirmation URL
    const confirmationURL: string = await createLimitedURL(
      user.id,
      "/user/confirm/",
      EmailType.ConfirmAccount
    );

    // console.log("CONFIRMATION URL: " + confirmationURL);

    // Sends Confirmation Email
    await sendEmail(email, confirmationURL, EmailType.ConfirmAccount);

    return user;
  }

  // Confirms User
  @Mutation(() => Boolean, {
    description: "Confirms User with URL Sent in Email"
  })
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    // Retrieves Token from Redis
    const userID = await redis.get(REDIS_PREFIXES.CONFIRM + token);

    // Return False if ID Does Not Exist in Redis
    if (!userID) return false;

    // Updates Confirmed in Database
    await User.update({ id: parseInt(userID, 10) }, { confirmed: true });

    // Removes Token from Redis
    await redis.del(REDIS_PREFIXES.CONFIRM + token);

    return true;
  }
}
