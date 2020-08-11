import {
  Resolver, Mutation, Arg, Ctx
} from "type-graphql";
import User from "../../entities/User";
import { MyContext } from "../../types";
import bcrypt from 'bcryptjs';
import { ERROR_MESSAGES } from "../../constants";


@Resolver()
export default class UserResolver {
  @Mutation(() => User, { description: "Adds Account Password for OAuth Users" })
  async addPassword(
    @Arg("password") password: string,
    @Ctx() context: MyContext
  ): Promise<User | undefined> {
    // Finds User from User Table
    const user = await User.findOne({ where: { id: context.req.session!.userId } });

    // Throws Error if User Not Found
    if (!user) throw new Error(ERROR_MESSAGES.USER);

    // Throws Error if Password Already Exists
    if (user.password) throw new Error(ERROR_MESSAGES.PASSWORD_EXISTS);

    // Hashes Password
    const hashedPassword: string = await bcrypt.hash(password, 12);

    // Saves New Password
    user.password = hashedPassword;
    User.save(user);

    return user;
  }

  @Mutation(() => User, { description: "Adds Account Username for OAuth Users" })
  async addUsername(
    @Arg("username") username: string,
    @Ctx() context: MyContext
  ): Promise<User | undefined> {
    // Finds User from User Table
    const user = await User.findOne({ where: { id: context.req.session!.userId } });

    // Throws Error if User Not Found
    if (!user) throw new Error(ERROR_MESSAGES.USER);

    // Saves New Username
    user.username = username;
    User.save(user);

    return user;
  }
}
