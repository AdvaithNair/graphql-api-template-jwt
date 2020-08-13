import bcrypt from "bcryptjs";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { ERROR_MESSAGES } from "../../constants";
import Tokens from "../../entities/Tokens";
import User from "../../entities/User";
import { ACCESS_EXP, REFRESH_EXP } from "../../secrets";
import { AuthTokens, MyContext } from "../../types";
import { createTokens } from "../../utils/Token";

// Code to validate a user, given a password and the context (for cookie management)
const validateUser = async (
  user: User | undefined,
  password: string
): Promise<AuthTokens> => {
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

  // Sets Cookie
  return createTokens(user.id, user.role, user.count);
};

// Handles Web Login
const handleWeb = async (
  user: User | undefined,
  password: string,
  context: MyContext
): Promise<User | undefined> => {
  const tokens: AuthTokens = await validateUser(user, password);

  context.res.cookie("refresh-token", tokens.refresh, {
    expires: REFRESH_EXP,
    httpOnly: true
  });
  context.res.cookie("access-token", tokens.access, {
    expires: ACCESS_EXP,
    httpOnly: true
  });

  return user;
};

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
  ): Promise<User | undefined> {
    // Finds User from User Table
    const user = await User.findOne({ where: { email } });

    return handleWeb(user, password, context);
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
  ): Promise<User | undefined> {
    // Finds User from User Table
    const user = await User.findOne({ where: { username } });

    return handleWeb(user, password, context);
  }

  // Logs In User with Email on Mobile
  @Mutation(() => Tokens, {
    description: "Logs In User With Email on Mobile",
    nullable: true
  })
  async loginEmailMobile(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() context: MyContext
  ): Promise<Tokens | undefined> {
    // Finds User from User Table
    const user = await User.findOne({ where: { email } });

    const tokens: AuthTokens = await validateUser(user, password);

    // context.req.headers["Authorization"] = `Bearer ${tokens.access}`;
    // context.req.set("Authorization", `Bearer ${tokens.access}`);
    context.res.set({
      "Access-Control-Expose-Headers": "x-access-token,x-refresh-token",
      "x-access-token": tokens.access,
      "x-refresh-token": tokens.refresh
    });

    return tokens;
  }
}
