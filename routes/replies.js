'use strict';

const express = require('express');
const router = express.Router();

const {
  validateBoard,
  validatePassword,
  validateReplyId,
  validateText,
  validateThreadId,
  validationErrorReporterJSON
} = require('../middleware/validation.js');

const replyController = require('../controllers/replyController.js');

router
  .post('/:board',
    validateText,
    validatePassword,
    validateThreadId,
    validateBoard,
    validationErrorReporterJSON,
    replyController.postNewReply);

router
  .get('/:board',
    validateBoard,
    validateThreadId,
    validationErrorReporterJSON,
    replyController.getAllReplies);

router
  .put('/:board',
    validateReplyId,
    validateThreadId,
    validationErrorReporterJSON,
    replyController.putReportReply);

router
  .delete('/:board',
    validatePassword,
    validateReplyId,
    validateThreadId,
    validationErrorReporterJSON,
    replyController.deleteReply);

module.exports = router;
