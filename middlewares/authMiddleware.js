const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Accès refusé" });

    const jwtToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token;

    try {
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.type)) {
        return res.status(403).json({ message: "Accès interdit" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Token invalide" });
    }
  };
};

module.exports = authMiddleware;
