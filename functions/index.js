/**
 * Local network access setup:
 * firebase emulators:start --only functions --host 0.0.0.0
 * then open http://<your-lan-ip>:5001/lexifold-d8b1c/us-central1/helloWorld
 */

const functions = require("firebase-functions");

exports.helloWorld = functions.https.onRequest((req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  functions.logger.info("helloWorld called", { clientIp });

  res.status(200).json({
    ok: true,
    message: "Hello from Firebase Functions on LAN",
    clientIp,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
});
