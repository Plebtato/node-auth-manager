const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// welcome
router.get('/', (req, res) => {
    res.render('welcome');
})

// dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {name: req.user.name});
})

// dashboard confirm delete
router.get('/dashboard/delete', ensureAuthenticated, (req, res) => {
    res.render('delete', {name: req.user.name});
})

// dashboard change name
router.get('/dashboard/changename', (req, res) => {
    res.render('changename', {name: req.user.name});
})

// dashboard change password
router.get('/dashboard/changepassword', (req, res) => {
    res.render('changepassword', {name: req.user.name});
})

module.exports = router;