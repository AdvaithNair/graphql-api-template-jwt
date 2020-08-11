import { Resolver, Query, Ctx, UseMiddleware } from "type-graphql";
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

  // Gets Own User Info
  @Query(() => User, {
    description: "Gets Own User Information",
    nullable: true
  })
  async getOwnUser(@Ctx() context: MyContext): Promise<User | undefined> {
    // UserID
    const UserID: number = context.req.session!.userId;

    // Throw Error if User Does Not Exist
    if (!UserID) throw new Error(ERROR_MESSAGES.USER);

    // Returns the User
    return User.findOne(UserID);
  }
}
