// Express middleware to authenticate admin requests
const checkAdminAuth = (req, res, next) => {
  const { password } = req.body;
  if (password === 'admin') {
    next();
  } else {
    res.status(401).send({ error: 'Access denied' });
  }
};

export default checkAdminAuth;
