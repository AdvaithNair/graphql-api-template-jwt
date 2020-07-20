import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../../types";

const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  // Throw Error if Cookie Doesn't Exist
  if (!context.req.session!.userId) throw new Error("Not Authenticated");

  return next();
};

export default isAuth;
