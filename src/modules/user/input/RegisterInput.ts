import { MaxLength, IsEmail, MinLength, IsLowercase } from "class-validator";
import { InputType, Field } from "type-graphql";
import DoesEmailExist from "./validation/DoesEmailExist";
import DoesUsernameExist from "./validation/DoesUsernameExist";

@InputType()
export default class RegisterInput {
  @Field()
  @IsLowercase({ message: "Username Must Be Lowercase" })
  @MinLength(1, { message: "Username Too Short" })
  @MaxLength(30, { message: "Username Too Long" })
  @DoesUsernameExist({ message: "Username Already In Use" })
  username: string;

  @Field()
  @IsEmail()
  @DoesEmailExist({ message: "Email Already In Use" })
  email: string;

  @Field()
  birthday: string;

  @Field()
  @MinLength(6, { message: "Weak Password" })
  password: string;
}
