const express = require('express');
const { route } = require('.');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');

// user model
const User = require('../models/User');

// login page
router.get('/login', (req, res) => {
    res.render('login');
})

// register page
router.get('/register', (req, res) => {
    res.render('register');
})

// register handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }

    // check passwords match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match'});
    }

    // check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be 6 or more characters'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // validation passed
        User.findOne({email: email}).then(user => {
                if (user) {
                    // user exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password
                    });
                    console.log(newUser);
                    
                    // hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // set password to hash
                            newUser.password = hash;
                            // save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'Registration successful!')
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }

});

// login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have been logged out');
    res.redirect('/users/login')
})

// account delete handle
router.get('/delete', ensureAuthenticated, (req, res) => {
    User.deleteOne({email: req.user.email}).then(user => {
        console.log('Account deleted...');
    })
    req.logout();

    req.flash('success_msg', 'Your account has been deleted');
    res.redirect('/users/login')
})

// name change handle
router.post('/changename', (req, res) => {
    const { name } = req.body;
    let errors = [];
    // check name filled
    if (!name) {
        errors.push({ msg: 'Please fill in all fields'});
    }
    
    if (errors.length > 0) {
        res.render('changename', {
            errors,
            name
        });
    } else {
        User.findOneAndUpdate({email: req.user.email}, {name: name}).then(user => {
            console.log('Name updated to ' + name + '...');
        });
        res.redirect('/dashboard');
    }
});

// password change handle
router.post('/changepassword', (req, res) => {
    const { password, password2 } = req.body;
    let errors = [];
    // check name filled
    if (!password || !password2) {
        errors.push({ msg: 'Please fill in all fields'});
    }
    
    // check passwords match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match'});
    }

    // check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password must be 6 or more characters'});
    }

    if (errors.length > 0) {
        res.render('changepassword', {
            errors,
            password,
            password2
        });
    } else {
        // hash password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                // set password to hash
                const newPassword = hash;
                // update user
                User.findOneAndUpdate({email: req.user.email}, {password: newPassword}).then(user => {
                    console.log('Password updated');
                });
                res.redirect('/dashboard');
            })
        })
    }
});

module.exports = router;