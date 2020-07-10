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
import createLimitedURL from "../utils/createLimitedURL";
import redis from "../../redis";
import { MyContext, EmailType, UploadImage } from "../../types";
import { REDIS_PREFIXES } from "../../secrets";
import ChangePasswordInput from "./changePassword/ChangePasswordInput";
import { GraphQLUpload } from "graphql-upload";
import { createWriteStream } from "fs";

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

    // Throws Error if User Not Found
    if (!user) throw new Error("User Not Found");

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

    // Throws Error if User Not Found
    if (!user) throw new Error("User Not Found");

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

  // Forgot Password Send Email
  @Mutation(() => Boolean, {
    description: "Sends Email if User Forgot Password"
  })
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    // Searches for User
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User Not Found");

    // Creates Forgot Password URL
    const forgotPasswordURL: string = await createLimitedURL(
      user.id,
      "/user/change-password/",
      EmailType.ForgotPassword
    );

    // Sends Email
    await sendEmail(email, forgotPasswordURL, EmailType.ForgotPassword);

    return true;
  }

  // Forgot Password Change Password with Token
  @Mutation(() => User, {
    description: "Changes Password with URL Sent in Forgot Password Email",
    nullable: true
  })
  async changePassword(
    @Arg("data") { token, password }: ChangePasswordInput,
    @Ctx() context: MyContext
  ): Promise<User | null> {
    // Retreives Token from Redis
    const userID = await redis.get(REDIS_PREFIXES.FORGOT + token);

    // Throws Error if ID Does Not Exist in Redis
    if (!userID) throw new Error("URL Expired. Try Again.");

    // Gets User
    const user = await User.findOne(userID);
    if (!user) throw new Error("User Not Found");

    // Compares Password (Confirms New Password)
    const isSame: boolean = await bcrypt.compare(password, user.password);
    if (isSame)
      throw new Error(
        "New Password is the same as Current Password. Try Again."
      );

    // Updates Password
    const hashedPassword: string = await bcrypt.hash(password, 12); // Without Frontend
    // const hashedPassword: string = password; // With Frontend (Uncomment)

    await User.update(
      { id: parseInt(userID, 10) },
      { password: hashedPassword }
    );

    // Removes Token from Redis
    await redis.del(REDIS_PREFIXES.FORGOT + token);

    // Creates New Session (Logs in User)
    context.req.session!.userId = user.id;

    return user;
  }

  // Logs Out User
  @Mutation(() => Boolean)
  async logout(@Ctx() context: MyContext): Promise<boolean> {
    // Destroys Session on Server
    return new Promise((resolve, reject) =>
      context.req.session!.destroy(err => {
        if (err) {
          console.log(err);
          return reject(false);
        }

        // Clears Cookie from Browser
        context.res.clearCookie("qid");
        return resolve(true);
      })
    );
  }

  // Uploads Profile Picture to Server (Locally)
  // NOTE: When Testing, remove Context
  @Mutation(() => Boolean)
  async addProfilePictureLocal(
    @Arg("picture", () => GraphQLUpload)
    { filename, createReadStream }: UploadImage,
    @Ctx() context: MyContext
  ): Promise<boolean> {
    // UserID from Session
    const UserID: number = context.req.session!.userId;

    // Returns Null if User Does Not Exist
    if (!UserID) throw new Error("Unauthorized.");

    // Gets the User
    const user = await User.findOne(UserID);
    if (!user) throw new Error("User Not Found");

    // Reduces Filename
    const newFilename: string = user.username + '.' + filename.split('.')[1];
    console.log(newFilename);
  
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(
          createWriteStream(__dirname + `/../../../images/${filename}`)
        )
        .on("finish", () => resolve(true))
        .on("error", () => reject(false))
    );
  }

  // Uploads Profile Picture to AWS S3
  @Mutation(() => Boolean)
  async addProfilePictureAWS() {
    return false;
  }

  // Uploads Profile Picture to Firebase Storage Bucket
  @Mutation(() => Boolean)
  async addProfilePictureFirebase() {
    return true;
  }
}