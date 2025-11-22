require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

const app = express();
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');


// sessions & flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
 
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  
  res.locals.path = req.path;
  next();
});

app.use((req, res, next) => {
  const publicPrefixes = ['/auth', '/css', '/images', '/js', '/favicon.ico'];
  
  if (req.path === '/') return next();
  if (publicPrefixes.some(p => req.path.startsWith(p))) return next();
  if (req.session && req.session.user) return next();
  // set flash and redirect
  req.flash('error', 'Please sign in to continue');
  return res.redirect('/auth/login');
});

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/receipts', require('./routes/receiptRoutes'));
app.use('/delivery', require('./routes/deliveryRoutes'));
app.use('/transfer', require('./routes/transferRoutes'));

app.use('/history', require('./routes/transferRoutes'));
app.use('/adjustment', require('./routes/adjustmentRoutes'));
app.use('/export', require('./routes/exportRoutes'));
// stock route
app.use('/stock', require('./routes/stockRoutes'));
// Warehouse & Locations
app.use('/warehouse', require('./routes/warehouseRoutes'));
app.use('/locations', require('./routes/locationRoutes'));

const PORT= 5001;
app.listen(PORT, () => console.log('Server running on', PORT));
