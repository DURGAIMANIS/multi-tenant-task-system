const tenantMiddleware = (req, res, next) => {
  if (!req.conn || !req.dbName)
    return res.status(403).json({ message: "Tenant context missing" });
  next();
};

export default tenantMiddleware;
