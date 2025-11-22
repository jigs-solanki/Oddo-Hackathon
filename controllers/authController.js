const User = require('../models/User');

exports.showRegister = (req, res) => {
  // preserve next redirect if present
  const next = req.query.next || req.body && req.body.next || '/';
  res.render('auth/register', { next });
};
exports.showLogin = (req, res) => {
  const next = req.query.next || req.body && req.body.next || '/';
  res.render('auth/login', { next });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    req.flash('success', 'Registered. Please login.');
    const next = req.body && req.body.next ? req.body.next : '/';
    res.redirect('/auth/login?next=' + encodeURIComponent(next));
  } catch (err) {
    req.flash('error', 'Registration error: ' + (err.message||err));
    res.redirect('/auth/register');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }
  const valid = await user.matchPassword(password);
  if (!valid) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }
  // simple session
  req.session.user = { id: user._id, name: user.name, email: user.email };
  req.flash('success', 'Welcome ' + user.name);
  
  const redirectTo = (req.body && req.body.next) || req.query.next || '/';
  res.redirect(redirectTo);
};

exports.logout = (req, res) => {
  req.session.destroy(()=> res.redirect('/auth/login'));
};
