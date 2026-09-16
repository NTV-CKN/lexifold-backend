const functions = require("firebase-functions");
const admin = require("firebase-admin");

//middleware
const authMiddleware = require("./middleware/auth.middleware");
const adminMiddleware = require("./middleware/admin.middleware");

//Auth route
const authRoute = require("./routes/auth/auth.route");
//Study set route
const studySetRoute = require("./routes/study_set/study.set.route");

if (!admin.apps.length) {
  admin.initializeApp();
}

const express = require("express");
const cors = require("cors");

//App route
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

//Auth route
app.use("/v1", authRoute);

//Study set route
app.use("/v1", studySetRoute);

exports.api = functions.https.onRequest(app);