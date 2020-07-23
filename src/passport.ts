import passport from "passport";
import FacebookAuth from "./oauth/FacebookStrategy";
import GoogleAuth from "./oauth/GoogleStrategy";

// Initialize Facebook OAuth Strategy
passport.use(FacebookAuth);

// Initialize Google OAuth Strategy
passport.use(GoogleAuth);

// Adjusts Passport Settings
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

export default passport;