'use strict';

const Boards = require('../models/boards.js');
const Threads = require('../models/threads.js');
const Replies = require('../models/replies.js');

async function validateBoard(board)
{
  try
  {
    const boards = await Boards.find({'board': board}).exec();

    if (boards)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  catch (error)
  {
    console.error(`error validating board ${board}...`);
    console.error(error);

    return false;
  }
}

async function newThread(board, text, pass)
{
  const now = new Date();

  try
  {
    let threads;
    
    if (await validateBoard(board))
    {
      threads = Threads(board);
    }
    else
    {
      throw 'cowardly refusing to create thread because board could not be validated...';
    }

    const doc = {
      'text': text,
      'delete_password': pass,
      'created_on': now,
      'bumped_on': now,
      'reported': false
    };

    return await threads.create(doc);
  }
  catch (error)
  {
    console.error(`error creating thread ${text} at ${now.toUTCString()}...`);
    console.error(error);

    return null;
  }
}

module.exports = (app) =>
  {
    app.route('/api/threads/:board')
      .post(async (request, response) =>
            {
              const doc = await newThread(request.params.board,
                                          request.body.text,
                                          request.body.delete_password);

              if (doc === null)
              {
                return response
                  .status(500)
                  .json({'error': 'could not create thread'});
              }
              else
              {
                return response
                  .status(200)
                  .redirect(`/b/${request.params.board}/`);
              }
            });

    app.route('/api/threads/:board')
      .get(async (request, response) =>
            {
            });

    app.route('/api/threads/:board')
      .put(async (request, response) =>
            {
            });

    app.route('/api/threads/:board')
      .delete(async (request, response) =>
            {
            });

    app.route('/api/replies/:board')
      .post(async (request, response) =>
            {
            });

    app.route('/api/replies/:board')
      .get(async (request, response) =>
            {
            });

    app.route('/api/replies/:board')
      .put(async (request, response) =>
            {
            });

    app.route('/api/replies/:board')
      .delete(async (request, response) =>
            {
            });
  };
