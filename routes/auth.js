var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/auth/linkedin', passport.authenticate('linkedin'));
router.get('/auth/logout', function(req, res, next) {
   console.log(req.user);
     req.session.destroy(function(err) {
         res.redirect('/');
     })
 });
 router.get('/auth/linkedin/callback', passport.authenticate('linkedin', {failureRedirect: '/'}), function(req, res, send) {
     res.redirect('/');
 });
module.exports = router;
