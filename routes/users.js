var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Trip = require('../models/trip');

function authenticatedUser(req, res, next) {
  // If the user is authenticated, then we can continue with next
  // https://github.com/jaredhanson/passport/blob/a892b9dc54dce34b7170ad5d73d8ccfba87f4fcf/lib/passport/http/request.js#L74
  if (req.isAuthenticated()) return next();

  // Otherwise
  req.flash('errorMessage', 'Login to access!');
  return res.redirect('/users/login');
}

function unAuthenticatedUser(req, res, next) {
  if (!req.isAuthenticated()) return next();

  // Otherwise
  req.flash('errorMessage', 'You are already logged in!');
  return res.redirect('/');
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*GET login page. */
router.get('/login', function(req, res, next){
  res.render('login', { message: req.flash('loginMessage') });
});

router.post('/login', function(req, res, next){
  var loginStrategy = passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
  return loginStrategy(req, res);
})

/*GET signup page. */
router.get('/signup', function(req, res, next){
  res.render('signup', { message: req.flash('signupMessage') });
})

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/search', // redirect to the secure profile section
    failureRedirect : '/users/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

// LOGOUT
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

/*GET user settings page. */
router.get('/settings', authenticatedUser, function(req, res, next){
  console.log(req.user);
  var user = User.findOne({}, 'username email currentcity currentstate', function(err, user){
    console.log('form')
    console.log(user);
   res.render('settings', {user: req.user});
  })
});

router.put('/settings', function(req, res, next){
  User.findOneAndUpdate({ _id: req.user._id }, { 'local.username': req.body.username, 'local.email': req.body.email, 'local.currentcity': req.body.currentcity, 'local.currentstate': req.body.currentstate }, function(err, user) {
    if (err) console.log(err);
    console.log("update")
    console.log(user);
    res.redirect('/profile');
  });
});


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();
  // if they aren't redirect them to the home page
  res.redirect('/');
};




module.exports = router;
