import {
  Resolver,
  Mutation,
  Arg,
  Query,
  Ctx,
  UseMiddleware
} from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../../entity/User";
import RegisterInput from "./register/RegisterInput";
import isAuth from "../middleware/isAuth";
import sendEmail from "../utils/sendEmail";
import createConfirmationURL from "../utils/confirmURL";
import redis from "../../redis";
import { MyContext, EmailType } from "../../types";

@Resolver()
export default class UserResolver {
  @UseMiddleware(isAuth)
  @Query(() => String, {
    description: "Basic Hello World Query (With Authorization)"
  })
  async hello() {
    return "Hello World";
  }

  // Gets Own User Info
  @Query(() => User, {
    description: "Gets Own User Information",
    nullable: true
  })
  async getOwnUser(@Ctx() context: MyContext): Promise<User | undefined> {
    // UserID
    const UserID: number = context.req.session!.userId;

    // Returns Null if User Does Not Exist
    if (!UserID) return undefined;

    // Returns the User
    return User.findOne(UserID);
  }

  // Registers User
  @Mutation(() => User, { description: "Registers User in User Table" })
  async register(@Arg("data")
  {
    email,
    password,
    username
  }: RegisterInput): Promise<User> {
    // Hashes Password for Entry in User Table
    const hashedPassword: string = await bcrypt.hash(password, 12);

    // Enters User into Table
    const user = await User.create({
      email,
      password: hashedPassword,
      username
    }).save();

    // Creates Confirmation URL
    const confirmationURL: string = await createConfirmationURL(user.id);

    console.log("CONFIRMATION URL: " + confirmationURL);

    // Sends Confirmation Email
    await sendEmail(email, confirmationURL, EmailType.ConfirmAccount);

    return user;
  }

  // Logs In User with Email
  @Mutation(() => User, {
    description: "Logs In User With Email",
    nullable: true
  })
  async loginEmail(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() context: MyContext
  ): Promise<User | null> {
    // Finds User from User Table
    const user = await User.findOne({ where: { email } });

    // Returns Null if User Not Found
    if (!user) return null;

    // Compares Password
    const valid: boolean = await bcrypt.compare(password, user.password);

    // Throws Error if Password is Invalid
    if (!valid) throw new Error("Invalid Password");

    // Throws Error if Email Not Confirmed
    if (!user.confirmed) throw new Error("Email Not Confirmed");

    // Creates New Session
    context.req.session!.userId = user.id;

    return user;
  }

  // Logs In User with Username
  @Mutation(() => User, {
    description: "Logs In User With Username",
    nullable: true
  })
  async loginUsername(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() context: MyContext
  ): Promise<User | null> {
    // Finds User from User Table
    const user = await User.findOne({ where: { username } });

    // Returns Null if User Not Found
    if (!user) return null;

    // Compares Password
    const valid: boolean = await bcrypt.compare(password, user.password);

    // Throws Error if Password is Invalid
    if (!valid) throw new Error("Invalid Password");

    // Throws Error if Email Not Confirmed
    if (!user.confirmed) throw new Error("Email Not Confirmed");

    // Creates New Session
    context.req.session!.userId = user.id;

    return user;
  }

  // Confirms User
  @Mutation(() => Boolean, {
    description: "Confirms User with URL Sent in Email",
    nullable: true
  })
  async confirmUser(@Arg("token") token: string): Promise<boolean> {
    // Retrieves Token from Redis
    const userID = await redis.get(token);

    // Return False if ID Does Not Exist in Redis
    if (!userID) return false;

    // Updates Confirmed in Database
    await User.update({ id: parseInt(userID, 10) }, { confirmed: true });

    // Removes Token from Redis
    await redis.del(token);

    return true;
  }

  // Forgot Password Send Email
  @Mutation(() => Boolean, {
    description: "Sends Email if User Forgot Password",
    nullable: true
  })
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    //await sendEmail()
    console.log(email);
    return true;
  }
}
