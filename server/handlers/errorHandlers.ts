module.exports.catchErrors = (fn) => (req, res, next): string  => {
  return fn(req, res, next).catch((error: string) => {
    if (typeof error === "string") {      
      res.status(400).json({ message: error });
    }
    next(error);
  });
};

module.exports.mongooseError = (err: {errors: string[]}, req, res, next) => {
  if (!err.errors) return next(err);
  const errorKeys = Object.keys(err.errors);
  let message = "";
  errorKeys.forEach((key: string) => (message += err.errors[key].message + ", "));
  message = message.substr(0, message.length - 2);
  res.status(400).json({ message });
};

module.exports.productionError = (err:
{
  message: string,
  status:number
}, req, res, next) => {
  if (err) {
    console.log("err", err);
    res
      .status(err.status || 500)
      .json({ message: "Internal server error", error: err.message });
  }
  next();
};

module.exports.notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};
