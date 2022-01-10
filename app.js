require("dotenv").config();
const cors = require("cors");
const { CONFIG } = require("./config/config");

const express = require("express");
const fileMiddleware = require("express-multipart-file-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const bussinessRoutes = require("./routes/bussiness");
const salonsRoutes = require("./routes/salons");
const dataRoutes = require("./routes/appData");
const imageRoutes = require("./routes/images");

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors({ origin: CONFIG.FRONTEND_URL, credentials: true }));

app.use(fileMiddleware);

app.use(imageRoutes);
app.use(profileRoutes);
app.use("/auth", authRoutes);
app.use("/bussiness", bussinessRoutes);
app.use("/salons", salonsRoutes);
app.use("/data", dataRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    error: {
      message: message,
      status: status,
    },
    data: data,
  });
});

mongoose
  .connect(process.env.DB_CONNECT)
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => console.log(err));
