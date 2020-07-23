import { Resolver, Mutation, Ctx } from "type-graphql";

import { MyContext } from "../../types";

@Resolver()
export default class LogoutResolver {
  // Logs Out User
  @Mutation(() => Boolean)
  async logout(@Ctx() context: MyContext): Promise<boolean> {
    // Destroys Session on Server
    return new Promise((resolve, reject) =>
      context.req.session!.destroy(err => {
        if (err) {
          console.log(err);
          return reject(false);
        }

        // Clears Cookie from Browser
        context.res.clearCookie("qid");
        return resolve(true);
      })
    );
  }
}
