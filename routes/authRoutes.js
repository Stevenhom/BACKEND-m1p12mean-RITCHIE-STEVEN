const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload, uploadPath } = require("../middlewares/multerMiddleware");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Inscription

router.post("/client", upload.single("picture"), async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (user) {
      return res
        .status(400)
        .json({ message: "Email or phone number already used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
      picture: null,
      type: 1,
    });

    user = await user.save({ session });

    if (req.file) {
      const extension = path.extname(req.file.originalname);
      const newFileName = `${user._id}${extension}`;
      const oldPath = req.file.path;
      const newPath = path.join(uploadPath, newFileName);

      fs.renameSync(oldPath, newPath);

      user.picture = `assets/pictures/${newFileName}`;
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe invalide" });
    }

    // Vérifier si user.password est bien une string
    if (typeof user.password !== "string") {
      return res.status(500).json({
        message: "Erreur serveur : problème avec le hash du mot de passe",
      });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe invalide" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, type: user.type },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route protégée pour le manager
router.get("/admin", authMiddleware([3]), (req, res) => {
  res.json({ message: "Bienvenue, manager !" });
});

// Route protégée pour le mecano
router.get("/mecanicien", authMiddleware([2]), (req, res) => {
  res.json({ message: "Espace mécanicien !" });
});

// Route protégée pour le client
router.get("/client", authMiddleware([2, 3]), async (req, res) => {
    const path = require("path");
    const fs = require("fs");
  
    try {
      const users = await User.find({ type: 1 });
  
      const updatedUsers = users.map(user => {
        const userObject = user.toObject();
  
        if (user.picture) {
            const picturePath = path.join(__dirname, '..', user.picture);
          try {
            userObject.picture = fs.readFileSync(picturePath, { encoding: "base64" });
          } catch (err) {
            console.error(`Erreur lors du chargement de l'image pour ${user._id}:`, err.message);
            userObject.picture = null;
          }
        } else {
          userObject.picture = null;
        }
  
        return userObject;
      });
  
      res.status(200).json(updatedUsers);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs." });
    }
  });
  

module.exports = router;
