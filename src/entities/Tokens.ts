import { ObjectType, Field } from "type-graphql";

@ObjectType()
export default class Tokens {
  @Field()
  refresh: string;

  @Field()
  access: string;
}
