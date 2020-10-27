'use strict';

const express = require('express');
const router = express.Router();

const threadController = require('../controllers/threadController.js');

router
  .post('/:board', threadController.postNewThread);

// I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
// router
//   .get('/:board', threadController.getThreads);

router
  .put('/:board', threadController.putReportThread);

router
  .delete('/:board', threadController.deleteThread);

module.exports = router;
