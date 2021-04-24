const User = require("../models/User");
const sha256 = require("sha256");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const foundUser = await User.findOne({ email });
  if (foundUser) throw "User already exist";
  const user = new User({
    name,
    email,
    password: sha256(password + process.env.SALT),
  });
  await user.save();
  res.status(200).json({ message: `User ${name} successfully registered!` });
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });

  if (!user) {
    throw "User not found";
  }
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.SALT,
    {
      expiresIn: "24h",
    }
  );
  res.status(200).json({
    name: user.name,
    userId: user._id,
    token,
    message: "Successfully logged in!",
  });
};

module.exports.getAllUsers = async (req, res) => {
  const users = await User.aggregate([
    { $group: { _id: null, users: { $push: "$$ROOT" }, count: { $sum: 1 } } },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  if (users) {
    res.status(200).json(users[0]);
  }
};

module.exports.getUserById = async (req, res) => {};
