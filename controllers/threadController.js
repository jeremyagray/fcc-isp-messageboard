'use strict';

const Threads = require('../models/threads.js');

const boardController = require('./boardController.js');
const replyController = require('./replyController.js');

// const util = require('../utilities');

// POST /api/threads/:board request
//
// {
//     'text': string,
//     'delete_password': string
// }
//
// POST /api/threads/:board response
//
// redirect /b/:board

exports.postNewThread = async function(request, response) {
  const now = new Date();

  try {
    let threadModel;
    
    if (await boardController.validateBoard(request.params.board)) {
      threadModel = Threads(request.params.board);
    } else {
      // should re-render form with invalid board error
      return response.redirect('/');
    }

    const thread = {
      'text': request.body.text,
      'delete_password': request.body.delete_password,
      'created_on': now,
      'bumped_on': now,
      'reported': false
    };

    const threadData = await threadModel.create(thread);

    if (threadData === null) {
      return response
        .status(500)
        .json({'error': `could not create thread ${request.body.text} at ${now.toUTCString()}`});
    } else {
      return response
        .redirect(`/b/${request.params.board}/`);
    }
  } catch (error) {
    console.error(`error creating thread ${request.body.text} at ${now.toUTCString()}...`);
    console.error(error);

    return response
      .status(500)
      .redirect('/');
  }
};

// GET /api/threads/:board request
//
// GET /api/threads/:board response
//
// [
//   {
//     _id: MongoId,
//     created_on: Date,
//     replycount: number,
//     text: string,
//     replies: [
//       {
//         _id: MongoId,
//         created_on: Date,
//         text: string
//       }
//     ]
//   }
// ]

exports.getThreads = async function(request, response) {
  const now = new Date();

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
    const allThreads = await threads
      .find({})
      .sort({'bumped_on': 'desc'})
      .limit(10)
      .exec();

    if (allThreads === null) {
      return response
        .status(200)
        .json([]);
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
        let thread = {};

        let replies = await replyController
          .getReplies(board, allThreads[i]._id);

        thread = {
          '_id': allThreads[i]._id,
          'created_on': allThreads[i].created_on,
          'text': allThreads[i].text,
          'replycount': replies.length,
          'replies': replies.reverse().slice(0, 3).map((item) => {
            return {
              '_id': item._id,
              'created_on': item.created_on,
              'text': item.text
            };
          })
        };

        summary.push(thread);
      }

      return response
        .status(200)
        .json(summary);
    }
  } catch (error) {
    console.error(`error getting thread or replies for board ${request.params.board} at ${now.toUTCString()}...`);
    console.error(error);

    return response
      .status(500)
      .json({'error': `error getting thread or replies for board ${request.params.board} at ${now.toUTCString()}...`});
  }
};

// PUT /api/threads/:board request
//
// {
//     'thread_id': MongoId
// }
//
// PUT /api/threads/:board response
//
// 'success', 'incorrect password', 'invalid input'

exports.putReportThread = async function(request, response) {
  let threadModel;

  if (await boardController.validateBoard(request.params.board)) {
    threadModel = Threads(request.params.board);
  } else {
    return response
      .status(400)
      .json({'error': 'could not report thread'});
  }

  const updatedThread = await threadModel
    .findByIdAndUpdate(request.body.thread_id,
      {'reported': true}).exec();

  if (updatedThread === null) {
    return response
      .status(400)
      .json({'error': 'could not report thread'});
  } else {
    return response
      .status(200)
      .send('success');
  }
};

// DELETE /api/threads/:board request
//
// {
//     'text': string,
//     'delete_password': string
// }
//
// DELETE /api/threads/:board response
//
// 'success', 'incorrect password', 'invalid input'

exports.deleteThread = async function(request, response) {
  let threadModel;
  
  if (await boardController.validateBoard(request.params.board)) {
    threadModel = Threads(request.params.board);
  } else {
    return response
      .status(400)
      .send('invalid input');
  }

  const thread = await threadModel.findById(request.body.thread_id).exec();

  if (thread === null) {
    // No threads match.
    return response
      .status(400)
      .send('invalid input');
  } else if (request.body.thread_id === thread._id.toString()) {
    // Found the thread.
    if (request.body.delete_password == thread.delete_password) {
      // Passwords match.
      if (await threadModel.findByIdAndDelete(request.body.thread_id).exec()) {
        // Delete successful.
        return response
          .status(200)
          .send('success');
      } else {
        // Delete failed.
        return response
          .status(500)
          .send('delete failed');
      }
    } else {
      // Passwords do not match.
      return response
        .status(400)
        .send('incorrect password');
    }
  } else {
    // Some other problem; blame the user.
    return response
      .status(400)
      .send('invalid input');
  }
};
