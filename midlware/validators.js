module.exports.validateName = (req, res, next) => {
  try {
    const nameRegex = /[a-zA-Z\s]+/;
    if (!nameRegex.test(req.body.name)) throw "Chatroom name is not provided";
    next();
  } catch (e) {
    res.status(400).json({ message: e });
  }
};
module.exports.validateEmail = (req, res, next) => {
  try {
    const emailRegex = /gmail.com$/;
    if (!emailRegex.test(req.body.email))
      throw "Email is not supported from your domain";
    next();
  } catch (e) {
    res.status(400).json({ message: e });
  }
};

module.exports.validatePassword = (req, res, next) => {
  try {
    if (req.body.password.length < 6){
      throw "Password should have minimum 6 characters";
    }
    next()
  } catch (e) {
   res.status(400).json({ message: e });
  }
};
