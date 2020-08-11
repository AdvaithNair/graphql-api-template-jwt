import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../../entities/User";
import { MyContext } from "../../types";
import { ERROR_MESSAGES } from "../../constants";

// Code to validate a user, given a password and the context (for cookie management)
const validateUser = async (user: User | undefined, password: string, context: MyContext) => {
  // Throws Error if User Not Found
  if (!user) throw new Error(ERROR_MESSAGES.USER);

  // Throws Error if Password is Null (OAuth User)
  if (!user.password) throw new Error(ERROR_MESSAGES.OAUTH);

  // Compares Password
  const valid: boolean = await bcrypt.compare(password, user.password);

  // Throws Error if Password is Invalid
  if (!valid) throw new Error(ERROR_MESSAGES.USER);

  // Throws Error if Email Not Confirmed
  if (!user.confirmed) throw new Error(ERROR_MESSAGES.NOT_CONFIRMED);

  // Creates New Session
  context.req.session!.userId = user.id;

  return user;
}

@Resolver()
export default class LoginResolver {
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

    return await validateUser(user, password, context);
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

    return await validateUser(user, password, context);
  }
}
