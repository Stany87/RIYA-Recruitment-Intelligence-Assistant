/**
 * Agency Scope Middleware
 *
 * SECURITY-CRITICAL: This middleware ensures every request is scoped to the
 * authenticated user's agency. Apply at the router level — never per-route.
 *
 * Usage:
 *   router.use(requireAuth);
 *   router.use(agencyScope);
 *   // All routes below are now scoped to req.agencyId
 *
 * This middleware:
 * 1. Reads agencyId from the authenticated user (set by auth middleware)
 * 2. Attaches req.agencyId for use in all downstream controllers
 * 3. Rejects requests from users without a valid agencyId
 */
const agencyScope = (req, res, next) => {
  if (!req.user || !req.user.agencyId) {
    return res.status(403).json({
      success: false,
      message: 'Account is not associated with an agency. Contact support.',
    });
  }

  // Attach agencyId to request for easy access in controllers
  req.agencyId = req.user.agencyId;
  next();
};

module.exports = agencyScope;
