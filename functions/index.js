const functions = require("firebase-functions");
const next = require("next");

const dev = false; // Always false in Firebase
const app = next({ dev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();

exports.nextApp = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
