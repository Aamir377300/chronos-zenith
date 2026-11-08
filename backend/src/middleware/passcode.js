const { getOrCreateOwner } = require('../utils/owner');

/**
 * Require x-passcode header to match APP_PASSCODE, then attach the
 * singleton owner as req.user for streak/rating/task ownership.
 */
const requirePasscode = async (req, res, next) => {
  try {
    const expected = process.env.APP_PASSCODE;
    if (!expected) {
      return res.status(500).json({
        success: false,
        message: 'APP_PASSCODE is not configured on the server',
      });
    }

    const provided = req.headers['x-passcode'];
    if (!provided || provided !== expected) {
      return res.status(401).json({ success: false, message: 'Invalid passcode' });
    }

    req.user = await getOrCreateOwner();
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requirePasscode };
