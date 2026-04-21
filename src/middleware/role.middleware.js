// Usage: roleMiddleware("admin") or roleMiddleware("admin", "manager")
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ message: "Insufficient permissions" });
  next();
};

export default roleMiddleware;
