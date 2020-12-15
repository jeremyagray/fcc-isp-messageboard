'use strict';

const express = require('express');
const router = express.Router();

const {
  validateBoard,
  validatePassword,
  validateText,
  validateThreadId,
  validationErrorRedirector,
  validationErrorReporterHTML,
  validationErrorReporterJSON
} = require('../middleware/validation.js');

const threadController = require('../controllers/threadController.js');

router
  .post('/:board',
    validateBoard,
    validateText,
    validatePassword,
    validationErrorRedirector,
    threadController.postNewThread);

router
  .get('/:board',
    validateBoard,
    validationErrorReporterJSON,
    threadController.getThreads);

router
  .put('/:board',
    validateBoard,
    validateThreadId,
    threadController.putReportThread);

router
  .delete('/:board',
    validateBoard,
    validateThreadId,
    validatePassword,
    validationErrorReporterHTML,
    threadController.deleteThread);

module.exports = router;
