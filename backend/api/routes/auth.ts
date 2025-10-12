import { Buffer } from 'buffer';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { User } from '../db/schema.ts';

const router = Router();

router.get('/google', (req, res, next) => {
  const state = req.query.state as string | undefined;
  if (!state) {
    return res.status(400).send('State parameter is missing');
  }
  const authenticator = passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: state, 
  });
  authenticator(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  async (req, res) => {
    try {
      const user = req.user as any;

      const dbUser = await User.findOneAndUpdate(
        { providerId: user.id },
        {
          name: user.displayName,
          photoUrl: user.photos?.[0]?.value || null,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const token = jwt.sign(
        {
          id: dbUser._id,
          name: dbUser.name,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const state = req.query.state as string | undefined;
      
      if (!state) {
        console.error('State parameter missing from Google OAuth callback');
        return res.redirect(`dudulingo://auth/callback?error=missing_state`);
      }

      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
      const finalRedirectUrl = `${decodedState.redirectUri}?token=${token}`;
      
      res.redirect(finalRedirectUrl);

    } catch (error) {
      console.error("Error in Google callback:", error);
      const state = req.query.state as string | undefined;
      if (state) {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
        return res.redirect(`${decodedState.redirectUri}?error=callback_failed`);
      }
      res.redirect(`dudulingo://auth/callback?error=callback_failed`);
    }
  }
);

router.get('/failure', (req, res) => {
  res.status(401).send('Google authentication failed.');
});


export default router;