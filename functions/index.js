const functions = require("firebase-functions");
const admin = require("firebase-admin");

//middleware
const authMiddleware = require("./middleware/auth.middleware");
const adminMiddleware = require("./middleware/admin.middleware");

if (!admin.apps.length) {
  admin.initializeApp();
}

const express = require("express");
const cors = require("cors");

//App route
const app = express();
app.use(cors({origin: true}));
app.use(express.json());

exports.api = functions.https.onRequest(app);