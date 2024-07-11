const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User'); // Replace with your user model

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails']
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            // Check if the user already exists in your database
            let user = await User.findOne({ facebookId: profile.id });

            if (!user) {
                // Create a new user if not exists
                user = new User({
                    facebookId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value // Assuming Facebook provides email
                });
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
