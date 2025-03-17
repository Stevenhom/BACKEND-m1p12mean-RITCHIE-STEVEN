const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route accessible uniquement aux "managers"
router.get('/admin', authMiddleware(['manager']), (req, res) => {
  res.json({ message: 'Bienvenue, manager !' });
});

// Route accessible aux "clients" et "mecanos"
router.get('/dashboard', authMiddleware(['client', 'mecano']), (req, res) => {
  res.json({ message: 'Bienvenue sur le dashboard !' });
});

module.exports = router;
