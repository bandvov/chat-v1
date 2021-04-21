const proxy = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(proxy("*", { target: "https://chat-vv1.herokuapp.com" }));
};
