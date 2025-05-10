const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
  
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
  
    try {
      // Décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token décodé :", decoded);
  
      if (!decoded || !decoded.userId) {
        return res.status(400).json({ message: 'Invalid token' });
      }
  
      const userId = decoded.userId;
  
      // Trouver l'utilisateur associé à ce token
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Hashage mdp
      const bcrypt = require('bcrypt');
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
  
      await user.save();
  
      res.status(200).json({ message: 'Password reset successful' });
  
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;
