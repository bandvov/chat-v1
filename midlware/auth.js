const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw "Forbidden";
    const token = req.headers.authorization.replace("Bearer ", "");
    const { email } = jwt.verify(token, process.env.SALT);
    const userExist = await User.findOne({ email });

    if (!userExist) throw "Forbidden";
    
    req.body.owner = userExist._id;

    next();
  } catch (err) {
    res.status(401).json({ message: err });
  }
};
