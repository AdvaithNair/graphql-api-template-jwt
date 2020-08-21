import { Resolver, Mutation, Arg } from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../../entities/User";
import RegisterInput from "./input/RegisterInput";
import sendEmail from "../utils/SendEmail";
import createLimitedURL from "../utils/CreateLimitedURL";
import redis from "../../redis";
import { EmailType } from "../../types";
import { REDIS_PREFIXES, ERROR_MESSAGES } from "../../constants";
import { BCRYPT_SALT } from "../../secrets";

@Resolver()
export default class RegisterResolver {
  // Registers User
  @Mutation(() => User, { description: "Registers User in User Table" })
  async register(@Arg("data")
  {
    email,
    password,
    username,
    birthday
  }: RegisterInput): Promise<User> {
    // Hashes Password for Entry in User Table
    const hashedPassword: string = await bcrypt.hash(password, BCRYPT_SALT);

    // Enters User into Table
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      birthday
    }).save();

    // Creates Confirmation URL
    const confirmationURL: string = await createLimitedURL(
      user.id,
      "/user/confirm/",
      EmailType.ConfirmAccount
    );

    // Sends Confirmation Email
    await sendEmail(email, confirmationURL, EmailType.ConfirmAccount);

    return user;
  }

  // Registers User Without Confirmation
  @Mutation(() => User, { description: "Registers User in User Table" })
  async registerConfirmed(@Arg("data")
  {
    email,
    password,
    username,
    birthday
  }: RegisterInput): Promise<User> {
    // Hashes Password for Entry in User Table
    const hashedPassword: string = await bcrypt.hash(password, BCRYPT_SALT);

    // Enters User into Table
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      birthday,
      confirmed: true
    }).save();

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
    if (!userID) throw new Error(ERROR_MESSAGES.USER);

    // Updates Confirmed in Database
    await User.update({ id: parseInt(userID, 10) }, { confirmed: true });

    // Removes Token from Redis
    await redis.del(REDIS_PREFIXES.CONFIRM + token);

    return true;
  }
}
