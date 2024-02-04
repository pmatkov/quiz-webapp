const checkRole = (req, res, next, role) => {
  const decoded = req.decoded;

  if (decoded?.role !== role) {

    return res.status(403).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  next();
}

module.exports = checkRole;