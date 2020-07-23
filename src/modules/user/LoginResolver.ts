import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../../entity/User";
import { MyContext } from "../../types";

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

    // Throws Error if User Not Found
    if (!user) throw new Error("User Not Found");

    // Throws Error if Password is Null
    if (!user.password) throw new Error("Please Sign In With Listed Provider");

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
}
