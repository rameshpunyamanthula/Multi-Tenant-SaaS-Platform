module.exports = (req, res, next) => {
  const tenantIdFromToken = req.user?.tenantId;
  const tenantIdFromParams = req.params.tenantId || req.body.tenantId;

  if (!tenantIdFromToken) {
    return res.status(400).json({
      success: false,
      message: "Tenant information missing from token"
    });
  }

  if (tenantIdFromParams && tenantIdFromParams !== tenantIdFromToken) {
    return res.status(403).json({
      success: false,
      message: "Cross-tenant access is not allowed"
    });
  }

  req.tenantId = tenantIdFromToken;
  next();
};
