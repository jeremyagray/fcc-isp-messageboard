'use strict';

// const {body, param, query, validationResult} = require('express-validator');
const {body, param, validationResult} = require('express-validator');

const Threads = require('../models/threads.js');

const boardController = require('./boardController.js');
const replyController = require('./replyController.js');

const util = require('../utilities');

exports.postNewThread = [

  // Sanitize and validate.
  param('board').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Board name should be a non-empty, alphanumeric string.'),
  body('text').escape().stripLow(true).trim().isLength({min: 1}).withMessage('Text should be a non-empty string.'),
  body('delete_password').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Delete password should be an alphanumeric string.'),

  async function(request, response) {
    const errors = validationResult(request);

    if (! errors.isEmpty()) {
      return response.redirect('/');
    } else {
      const now = new Date();

      const board = request.params.board;
      const text = request.body.text;
      const pass = request.body.delete_password;

      try {
        let threads;
        
        if (await boardController.validateBoard(board)) {
          threads = Threads(board);
        } else {
          // should re-render form with invalid board error
          return response.redirect('/');
        }

        const post = {
          'text': text,
          'delete_password': pass,
          'created_on': now,
          'bumped_on': now,
          'reported': false
        };

        const doc = await threads.create(post);

        if (doc === null) {
          return response
            .status(500)
            .json({'error': 'could not create thread'});
        } else {
          return response
            .redirect(`/b/${request.params.board}/`);
        }
      } catch (error) {
        console.error(`error creating thread ${text} at ${now.toUTCString()}...`);
        console.error(error);

        return response
          .status(500)
          .redirect('/');
      }
    }
  }
];

exports.getThreads = [

  // Sanitize and validate.
  param('board').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Board name should be a non-empty, alphanumeric string.'),

  async function(request, response) {
    const now = new Date();
    const errors = validationResult(request);

    if (! errors.isEmpty()) {
      return response
        .status(400)
        .json({'error': 'invalid input'});
    } else {
      try {
        let threads;
        const board = request.params.board;
        
        // Validate the board and then return the thread model.
        if (await boardController.validateBoard(board)) {
          threads = Threads(board);
        } else {
          // should re-render form with invalid board error
          return response
            .status(400)
            .json({'error': 'invalid board'});
        }

        // Get the sorted list of threads.
        const allThreads = await threads.find({}).sort({bumped_on: 'desc'}).limit(10).exec();

        if (allThreads === null) {
          return response
            .status(200)
            .json({'threads': []});
        } else {
          let num = 0;

          // Set number of threads to return.
          if (allThreads.length > 10) {
            num = 10;
          } else {
            num = allThreads.length;
          }

          let summary = [];
          for (let i = 0; i < num; i++) {
            summary.push({
              '_id': allThreads[i]._id,
              'replies': await replyController.getReplies(board,
                allThreads[i]._id,
                3)
            });
          }

          return response
            .status(200)
            .json({
              'threads': summary
            });
        }
      } catch (error) {
        console.error(`error getting thread or replies for board ${request.params.board} at ${now.toUTCString()}...`);
        console.error(error);

        return response
          .status(500)
          .json({'error': `error getting thread or replies for board ${request.params.board} at ${now.toUTCString()}...`});
      }
    }
  }
];

exports.putReportThread = [

  // Sanitize and validate.
  param('board').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Board name should be alphanumeric and non-empty.'),
  body('thread_id').escape().stripLow(true).trim().isLength({min: 1}).isHexadecimal().withMessage('Thread ID should be a non-empty, hexadecimal string.'),

  async function(request, response) {
    let threads;
    let id;

    const board = request.params.board;

    if (util.isValidId(request.body.thread_id)) {
      id = request.body.thread_id;
    } else {
      return response
        .status(400)
        .json({'error': 'could not report thread'});
    }

    if (await boardController.validateBoard(board)) {
      threads = Threads(board);
    } else {
      return response
        .status(400)
        .json({'error': 'could not report thread'});
    }

    const update = {
      '_id': id,
      'reported': true
    };

    const updatedThread = await threads.findByIdAndUpdate(id, update).exec();

    if (updatedThread === null) {
      return response
        .status(400)
        .json({'error': 'could not report thread'});
    } else {
      return response
        .status(200)
        .send('success');
    }
  }
];

exports.deleteThread = [

  // Sanitize and validate.
  param('board').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Board name should be a non-empty, alphanumeric string.'),
  body('_id').escape().stripLow(true).trim().isLength({min: 1}).isHexadecimal().withMessage('Thread ID should be a non-empty, hexadecimal string.'),
  body('delete_password').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Delete password should be an alphanumeric string.'),

  async function(request, response) {
    const errors = validationResult(request);

    if (! errors.isEmpty()) {
      return response
        .status(400)
        .send('invalid input');
    } else {
      const board = request.params.board;
      let id;
      const pass = request.body.delete_password;

      if (util.isValidId(request.body._id)) {
        id = request.body._id;
      } else {
        return response
          .status(400)
          .send('invalid input');
      }

      let threads;
      
      if (await boardController.validateBoard(board)) {
        threads = Threads(board);
      } else {
        return response
          .status(400)
          .send('invalid input');
      }

      const doc = await threads.findById(id).exec();

      if (doc === null) {
        // console.log('no thread');
        return response
          .status(400)
          .send('invalid input');
      } else if (id == doc._id.toString()) {
        if (pass == doc.delete_password) {
          if (await threads.findByIdAndDelete(id).exec()) {
            return response
              .status(200)
              .send('success');
          } else {
            return response
              .status(400)
              .send('invalid input');
          }
        } else {
          // console.log('bad password');
          return response
            .status(400)
            .send('incorrect password');
        }
      } else {
        // console.log('doc id does not match');
        // console.log(doc._id);
        return response
          .status(400)
          .send('invalid input');
      }
    }
  }
];
