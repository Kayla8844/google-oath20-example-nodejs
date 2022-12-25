const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user-model');

router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/auth/login',
    failureFlash: 'Wrong email or password.',
  }),
  (req, res) => {
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = '';
      res.redirect(newPath);
    } else {
      res.redirect('/profile');
    }
  }
);

router.get('/signup', (req, res) => {
  res.render('signup', { user: req.user });
});

router.post('/signup', async (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;

  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash('error_msg', 'Email has already been registered.');
    res.redirect('/auth/signup');
  }

  const hash = await bcrypt.hash(password, 10);
  password = hash;

  let newUser = new User({ name, email, password });
  try {
    await newUser.save();
    req.flash('success_msg', 'Registration succeeds. You can login now.');
    res.redirect('/auth/login');

    // const savedUser = await newUser.save();
    // res.status(200).send({
    //   msg: 'User saved.',
    //   savedObj: savedUser,
    // });
  } catch (error) {
    console.log(error.errors.name.properties);
    req.flash('error_msg', error.errors.name.properties.message);
    res.redirect('/auth/signup');
    // res.status(400).send(error);
  }
});

router.get('/logout', (req, res) => {
  console.log(req.logOut());
  req.logOut();
  res.redirect('/');
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = '';
    res.redirect(newPath);
  } else {
    res.redirect('/profile');
  }
});

module.exports = router;
