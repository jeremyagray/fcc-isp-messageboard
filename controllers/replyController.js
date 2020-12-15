'use strict';

const Replies = require('../models/replies.js');
const Threads = require('../models/threads.js');

const boardController = require('./boardController.js');

exports.getReplies = async function(board, threadId) {
  // console.log('hello from here');
  let replyModel = Replies(board);
  let replies = await replyModel
    .find({thread_id: threadId})
    .sort({created_on: 'asc'})
    .exec();

  if (replies === null) {
    return [];
  }

  return replies;
};

// POST /api/replies/:board request
//
// {
//   'text': string,
//   'delete_password': string,
//   'thread_id': MongoId
// }
//
// POST /api/replies/:board response
//
// redirect /b/:board/:thread_id

exports.postNewReply = async function(request, response) {
  let replyModel;
  let threadsModel;
  let now = new Date();
  
  if (await boardController.validateBoard(request.params.board)) {
    replyModel = Replies(request.params.board);
    threadsModel = Threads(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  const replyData = {
    text: request.body.text,
    delete_password: request.body.delete_password,
    thread_id: request.body.thread_id,
    created_on: now
  };
    
  const reply = await replyModel.create(replyData);

  if (reply === null) {
    return response
      .status(500)
      .json({'error': 'could not create reply'});
  }

  const thread = await threadsModel.findByIdAndUpdate(request.body.thread_id,
    {'bumped_on': now}).exec();

  if (thread === null) {
    return response
      .status(500)
      .json({'error': 'could not update thread'});
  }

  return response
    .status(200)
    .redirect(`/b/${request.params.board}/${request.body.thread_id}`);
};

// GET /api/replies/:board request
//
// {
//   'thread_id': MongoId
// }
//
// GET /api/replies/:board response
//
// {
//   '_id': MongoId,
//   'created_on': Date,
//   'text': string,
//   'replies': [
//     {
//       '_id': MongoId,
//       'created_on': Date,
//       'text': string
//     }
//   ]
// }

exports.getAllReplies = async function(request, response) {
  let replyModel;
  let threadModel;

  if (await boardController.validateBoard(request.params.board)) {
    replyModel = Replies(request.params.board);
    threadModel = Threads(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  const thread = await threadModel
    .findById(request.query.thread_id)
    .exec();
  const replies = await replyModel
    .find({'thread_id': request.query.thread_id})
    .exec();

  return response
    .status(200)
    .json({
      '_id': thread._id,
      'created_on': thread.created_on,
      'text': thread.text,
      'replies': replies.map((item) => {
        return {
          '_id': item._id,
          'created_on': item.created_on,
          'text': item.text
        };
      })
    });
};

// PUT /api/replies/:board request
//
// {
//   'thread_id': MongoId,
//   'reply_id': MongoId
// }
//
// PUT /api/replies/:board response
//
// 'success', 'failure', or redirect /

exports.putReportReply = async function(request, response) {
  let replyModel;

  if (await boardController.validateBoard(request.params.board)) {
    replyModel = Replies(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  const reply = await replyModel.findOneAndUpdate({
    '_id': request.body.reply_id,
    'thread_id': request.body.thread_id
  }, {'reported': true}).exec();

  if (reply) {
    return response
      .status(200)
      .send('success');
  } else {
    return response
      .status(400)
      .send('failure');
  }
};

// I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success')

// DELETE /api/replies/:board request
//
// {
//   'thread_id': MongoId,
//   'reply_id': MongoId,
//   'delete_password': string
// }
//
// DELETE /api/replies/:board response
//
// 'success', 'failure', 'incorrect password', or redirect /

exports.deleteReply = async function(request, response) {
  let replyModel;

  if (await boardController.validateBoard(request.params.board)) {
    replyModel = Replies(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  let reply = await replyModel.findOne({
    '_id': request.body.reply_id,
    'thread_id': request.body.thread_id
  }).exec();

  if (reply.delete_password === request.body.delete_password) {
    reply = await replyModel.findOneAndUpdate({
      '_id': request.body.reply_id,
      'thread_id': request.body.thread_id
    }, {'text': '[deleted]'}).exec();


    if (reply) {
      return response
        .status(200)
        .send('success');
    } else {
      return response
        .status(500)
        .send('failure');
    }
  } else {
    return response
      .status(400)
      .send('incorrect password');
  }
};
