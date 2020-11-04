'use strict';

const express = require('express');
const router = express.Router();

const threadController = require('../controllers/threadController.js');

router
  .post('/:board', threadController.postNewThread);

router
  .get('/:board', threadController.getThreads);

router
  .put('/:board', threadController.putReportThread);

router
  .delete('/:board', threadController.deleteThread);

module.exports = router;
