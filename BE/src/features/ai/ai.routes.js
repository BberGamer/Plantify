const express = require('express');
const aiController = require('./ai.controller');

const router = express.Router();

router.post('/chat', aiController.generateText);

module.exports = router;
