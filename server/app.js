const express = require("express");
const cors = require("cors");
const {
  notFound,
  mongooseError,
  productionError,
} = require("./handlers/errorHandlers");
const path = require("path");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "../client/build")));
app.any("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// setup routes
app.use(require("./routes/chatroom"));
app.use(require("./routes/user"));

// setup error handlers
app.use(notFound);
app.use(mongooseError);
app.use(productionError);

module.exports = app;
