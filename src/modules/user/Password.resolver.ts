import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../../entities/User";
import sendEmail from "../utils/SendEmail";
import createLimitedURL from "../utils/CreateLimitedURL";
import redis from "../../redis";
import { MyContext, EmailType } from "../../types";
import { REDIS_PREFIXES, ERROR_MESSAGES } from "../../constants";
import ChangePasswordInput from "./input/ChangePasswordInput";
import { BCRYPT_SALT } from "../../secrets";

@Resolver()
export default class PasswordResolver {
  // Forgot Password Send Email
  @Mutation(() => Boolean, {
    description: "Sends Email if User Forgot Password"
  })
  async forgotPassword(@Arg("email") email: string): Promise<boolean> {
    // Searches for User
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error(ERROR_MESSAGES.USER);

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
    if (!userID) throw new Error(ERROR_MESSAGES.PASSWORD_URL_EXPIRED);

    // Gets User
    const user = await User.findOne(userID);
    if (!user) throw new Error(ERROR_MESSAGES.USER);

    // Compares Password (Confirms New Password)
    const isSame: boolean = await bcrypt.compare(password, user.password);
    if (isSame) throw new Error(ERROR_MESSAGES.NEW_PASSWORD_IS_SAME);

    // Updates Password
    const hashedPassword: string = await bcrypt.hash(password, BCRYPT_SALT); // Without Frontend
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
}
