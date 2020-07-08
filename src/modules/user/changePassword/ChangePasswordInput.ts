import { MinLength } from "class-validator";
import { InputType, Field } from "type-graphql";

@InputType()
export default class ChangePasswordInput {
  @Field()
  token: string;

  @Field()
  @MinLength(6, { message: "Weak Password" })
  password: string;
}
