import express from "express";
import passport = require("passport");
import { createFacebookUser } from "../../oauth/CreateUserOAuth";
import { FACEBOOK_OAUTH_SCOPES } from "../../secrets";

const facebook = express.Router();

// Facebook OAuth Authentication
facebook.get(
  "/",
  passport.authenticate("facebook", { scope: FACEBOOK_OAUTH_SCOPES })
);

// Facebook OAuth Callback Redirect
facebook.get("/callback", (req, res, next) => {
  passport.authenticate("facebook", async (_err, user, _info) => {
    (req as any).userID = await createFacebookUser(res, user);
    res.redirect("/graphql");
  })(req, res, next);
});

export default facebook;
