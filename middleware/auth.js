module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.session && req.session.user) return next();
    req.flash('error', 'Please sign in to access that page');
    return res.redirect('/auth/login');
  },
  ensureGuest: (req, res, next) => {
    if (!req.session || !req.session.user) return next();
    return res.redirect('/');
  }
};
