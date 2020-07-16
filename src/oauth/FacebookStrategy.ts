import { FACEBOOK_APP, FACEBOOK_OAUTH_FIELDS } from "../secrets";
import { FacebookResponse } from "src/types";
const FacebookStrategy = require("passport-facebook");

const FacebookAuth = new FacebookStrategy(
  {
    clientID: FACEBOOK_APP.ID,
    clientSecret: FACEBOOK_APP.SECRET,
    callbackURL: `http://localhost:4000/auth/facebook/callback`,
    profileFields: FACEBOOK_OAUTH_FIELDS
  },
  (accessToken: string, _refreshToken: any, profile: any, cb: any) => {
    // console.log(profile);
    const profilePicture: string = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`;
    const returnProfile: FacebookResponse = profile._json;
    returnProfile.picture = profilePicture;
    // console.log(returnProfile);
    return cb(null, profile);
  }
);

export default FacebookAuth;
