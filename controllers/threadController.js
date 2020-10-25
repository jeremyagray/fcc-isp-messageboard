'use strict';

const Threads = require('../models/threads.js');

const boardController = require('../controllers/boardController.js');

exports.postNewThread = async function(request, response)
{
  const now = new Date();

  // These need validation.
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
      throw 'cowardly refusing to create thread because board could not be validated...';
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
        .status(200)
        .redirect(`/b/${request.params.board}/`);
    }
  }
  catch (error)
  {
    console.error(`error creating thread ${text} at ${now.toUTCString()}...`);
    console.error(error);

    return null;
  }
}
