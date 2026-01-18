function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const userRole = req.user.rol || req.user.role;

    if (!userRole) {
      return res.status(401).json({ message: "Rol no disponible en el token" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Acceso denegado: permisos insuficientes" });
    }

    next();
  };
}

module.exports = requireRole;