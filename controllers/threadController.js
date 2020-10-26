'use strict';

const {body, param, validationResult} = require('express-validator');

const Threads = require('../models/threads.js');

const boardController = require('./boardController.js');

const util = require('../utilities');

exports.postNewThread = [

  // Sanitize and validate.
  param('board').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Board name should be a non-empty, alphanumeric string.'),
  body('text').escape().stripLow(true).trim().isLength({min: 1}).withMessage('Text should be a non-empty string.'),
  body('delete_password').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Delete password should be an alphanumeric string.'),

  async function(request, response)
  {
    const errors = validationResult(request);

    if (! errors.isEmpty())
    {
      return response.redirect('/');
    }
    else
    {
      const now = new Date();

      const board = request.params.board;
      const text = request.body.text;
      const pass = request.body.delete_password;

      try
      {
        let threads;
        
        if (await boardController.validateBoard(board))
        {
          threads = Threads(board);
        }
        else
        {
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

        if (doc === null)
        {
          return response
            .status(500)
            .json({'error': 'could not create thread'});
        }
        else
        {
          return response
            .redirect(`/b/${request.params.board}/`);
        }
      }
      catch (error)
      {
        console.error(`error creating thread ${text} at ${now.toUTCString()}...`);
        console.error(error);

        return response
          .status(500)
          .redirect('/');
      }
    }
  }
];

exports.putReportThread = [

  // Sanitize and validate.
  param('board').escape().stripLow(true).trim().isLength({min: 1}).isAlphanumeric().withMessage('Board name should be alphanumeric and non-empty.'),
  body('thread_id').escape().stripLow(true).trim().isLength({min: 1}).isHexadecimal().withMessage('Thread ID should be a non-empty, hexadecimal string.'),

  async function(request, response)
  {
    const now = new Date();
    let threads;
    let id;

    const board = request.params.board;

    if (util.isValidId(request.body.thread_id))
    {
      id = request.body.thread_id;
    }
    else
    {
      return response
        .status(500)
        .json({'error': 'could not report thread'});
    }

    if (await boardController.validateBoard(board))
    {
      threads = Threads(board);
    }
    else
    {
      return response
        .status(500)
        .json({'error': 'could not report thread'});
    }

    const update = {
      '_id': id,
      'reported': true
    };

    const updatedThread = await threads.findByIdAndUpdate(id, update).exec();

    if (updatedThread === null)
    {
      return response
        .status(500)
        .json({'error': 'could not report thread'});
    }
    else
    {
      return response
        .status(200)
        .send('success');
    }
  }
];
