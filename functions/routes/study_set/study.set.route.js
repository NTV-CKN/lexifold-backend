const express = require("express");
const router = express.Router();
const studySetController = require("../../controllers/study_set/study.set.controller");

//auth middleware
const { authenticateToken } = require("../../middleware/auth.middleware");

router.post(
    "/study-set/create-with-vocabs",
    authenticateToken,
    (req, res) => studySetController.createStudySetWithVocabs(req, res)
);

module.exports = router;