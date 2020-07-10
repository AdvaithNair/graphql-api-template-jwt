import {
  Resolver, Mutation
} from "type-graphql";
import User from "../../entity/User";


@Resolver()
export default class UserResolver {
  @Mutation(() => User, { description: "Registers User using Google OAuth in User Table" })
  async googleSignIn(): Promise<Boolean> {
    return true;
  }
}
