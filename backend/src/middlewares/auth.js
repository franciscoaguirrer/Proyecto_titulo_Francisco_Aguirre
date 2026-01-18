const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Acceso denegado. Token no enviado.",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Formato de token inválido.",
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.id || decoded?._id || decoded?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Token válido, pero sin id de usuario (id/_id/userId).",
      });
    }

    req.user = decoded;
    req.userId = userId; 
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado.",
    });
  }
}

module.exports = auth;