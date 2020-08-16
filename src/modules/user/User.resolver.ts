import { Resolver, Query, Ctx, UseMiddleware, Mutation } from "type-graphql";
import User from "../../entities/User";
import isAuth from "../middleware/isAuth";
import { MyContext } from "../../types";
import { ERROR_MESSAGES } from "../../constants";

@Resolver()
export default class UserResolver {
  @UseMiddleware(isAuth)
  @Query(() => String, {
    description: "Basic Hello World Query (With Authorization)"
  })
  async hello() {
    return "Hello World";
  }

  @Query(() => String, {
    description: "Basic Hello World Query"
  })
  async helloWorld() {
    return "Hello World";
  }

  // Gets Own User Info
  @Query(() => User, {
    description: "Gets Own User Information",
    nullable: true
  })
  async getOwnUser(@Ctx() context: MyContext): Promise<User | undefined> {
    // UserID
    const UserID: number = (context as any).req!.userID;

    // Throw Error if User Does Not Exist
    if (!UserID) throw new Error(ERROR_MESSAGES.USER);

    // Returns the User
    return User.findOne(UserID);
  }

  @Mutation(() => Boolean, { description: "Invalidates Access Token" })
  async invalidateTokens(@Ctx() context: MyContext): Promise<Boolean> {
    // Find User
    const user = await User.findOne((context as any).req.userID);
    if (!user) throw new Error(ERROR_MESSAGES.USER);

    // Update Count on Database
    user.count += 1;
    await user.save();

    return true;
  }
}
