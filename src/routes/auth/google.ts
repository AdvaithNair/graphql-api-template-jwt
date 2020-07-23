import express from "express";
import passport = require("passport");
import { createGoogleUser } from "../../oauth/CreateUserOAuth";
import { GOOGLE_OAUTH_SCOPES } from "../../secrets";

const google = express.Router();

// Google OAuth Authentication
google.get(
  "/",
  passport.authenticate("google", {
    scope: GOOGLE_OAUTH_SCOPES
  })
);

// Google OAuth Callback Redirect
google.get("/callback", (req, res, next) => {
  passport.authenticate("google", async (_err, user, _info) => {
    req.session!.userId = await createGoogleUser(req, user);
    res.redirect("/graphql");
  })(req, res, next);
});

export default google;
