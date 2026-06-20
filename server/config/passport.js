const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        const base = (profile.name?.givenName || profile.displayName)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        let username = base;
        let attempts = 0;
        while (await User.findOne({ username })) {
          attempts++;
          if (attempts >= 5) {
            username = base + Math.floor(Math.random() * 9000 + 1000);
            break;
          }
          username = base + (Math.floor(Math.random() * 90) + 10);
        }

        user = await User.create({
          username,
          email: profile.emails[0].value,
          googleId: profile.id
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;