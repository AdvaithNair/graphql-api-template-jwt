import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import User from "../../entities/User";
import { MyContext, AuthTokens } from "../../types";
import { ERROR_MESSAGES } from "../../constants";
import { JWT_SECRETS, REFRESH_EXP, ACCESS_EXP } from "../../secrets";

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

  // Creates New Tokens
  const refreshToken: string = sign(
    { userID: user.id, count: user.count },
    JWT_SECRETS.REFRESH,
    {
      expiresIn: JWT_SECRETS.REFRESH_EXP
    }
  );
  const accessToken: string = sign(
    { userID: user.id, role: user.role },
    JWT_SECRETS.ACCESS,
    {
      expiresIn: JWT_SECRETS.ACCESS_EXP
    }
  );

  // Sets Cookie
  return {
    refresh: refreshToken,
    access: accessToken
  };
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
}
