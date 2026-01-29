import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './database';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email found from Google profile'));
                }

                // Upsert user based on email (handling case where user registered via email first)
                // Note: For security, you might want to only link if verified, but for this demo:
                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (user) {
                    // If user exists but no googleId, link it
                    if (!user.googleId) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                googleId: profile.id,
                                profilePic: user.profilePic || profile.photos?.[0].value
                            },
                        });
                    }
                } else {
                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            googleId: profile.id,
                            profilePic: profile.photos?.[0].value,
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as any, undefined);
            }
        }
    )
);

export default passport;
