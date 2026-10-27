import { User } from "../models/User.js";
import { DEMO_USER_EMAIL } from "../utils/constants.js";

/**
 * Middleware that retrieves or creates the default demo user and attaches it to req.user.
 */
export async function demoUser(req, res, next) {
  try {
    let user = await User.findOne({ email: DEMO_USER_EMAIL });
    if (!user) {
      user = await User.create({ email: DEMO_USER_EMAIL });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
