import { FACEBOOK_APP, FACEBOOK_OAUTH_FIELDS, PORT } from "../secrets";
// import { FacebookResponse } from "../types";
const FacebookStrategy = require("passport-facebook");

const FacebookAuth = new FacebookStrategy(
  {
    clientID: FACEBOOK_APP.ID,
    clientSecret: FACEBOOK_APP.SECRET,
    callbackURL: `http://localhost:${PORT}/auth/facebook/callback`,
    profileFields: FACEBOOK_OAUTH_FIELDS
  },
  (_accessToken: string, _refreshToken: any, profile: any, done: any) => {
    /*const profilePicture: string = `http://graph.facebook.com/${profile.id}/picture?type=large`;
    const returnProfile: FacebookResponse = profile._json;
    returnProfile.picture = profilePicture;
    console.log(returnProfile);*/
    return done(null, profile);
  }
);

export default FacebookAuth;
