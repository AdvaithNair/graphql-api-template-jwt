import { MiddlewareFn } from "type-graphql";
import { MyContext } from "src/types";

const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session!.userId) throw new Error("Not Authenticated");

  return next();
};

export default isAuth;
