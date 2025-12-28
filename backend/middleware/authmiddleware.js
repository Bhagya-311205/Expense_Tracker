// Session-based authentication middleware (commented out for JWT)
// module.exports = (req, res, next) => {
//   if (!req.session?.user) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//
//   req.user = req.session.user;
//   next();
// };

// JWT-based authentication middleware - imported from jwtAuthMiddleware to avoid duplication
const { jwtAuthMiddleware } = require("./jwtAuthMiddleware");

module.exports = jwtAuthMiddleware;