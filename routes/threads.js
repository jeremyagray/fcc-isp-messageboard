'use strict';

const express = require('express');
const router = express.Router();

const threadController = require('../controllers/threadController.js');

router
  .post('/:board', threadController.postNewThread);

// I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
router
  .get('/:board', async (request, response) =>
       {
       });

router
  .put('/:board', threadController.putReportThread);

// I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
router
  .delete('/:board', async (request, response) =>
          {
          });

module.exports = router;
