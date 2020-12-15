'use strict';

// const Boards = require('../models/boards.js');
const Replies = require('../models/replies.js');
const Threads = require('../models/threads.js');

const boardController = require('./boardController.js');

exports.getReplies = async function(board, threadId, num = null) {
  // console.log('hello from here');
  let replyModel = Replies(board);
  let replies = await replyModel
    .find({thread_id: threadId})
    .sort({created_on: 'asc'})
    .exec();

  if (replies === null) {
    return [];
  } else {
    let items = 0;

    // Set number of replies to return.
    if (num === null) {
      // Return all replies.
      items = replies.length;
    } else {
      // Return either num replies or all of them.
      if (replies.length > num) {
        items = num;
      } else {
        items = replies.length;
      }
    }

    let ids = [];
    for (let i = 0; i < items; i++) {
      ids.push(replies[i]._id);
    }

    return ids;
  }
};

// I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id to /api/replies/{board} and it will also update the bumped_on date to the comments date.(Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.

exports.postNewReply = async function(request, response) {
  let replies;
  let threads;
  let now = new Date();
  
  if (await boardController.validateBoard(request.params.board)) {
    replies = Replies(request.params.board);
    threads = Threads(request.params.board);
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
    
  const reply = await replies.create(replyData);

  if (reply === null) {
    return response
      .status(500)
      .json({'error': 'could not create reply'});
  }

  const thread = await threads.findByIdAndUpdate(request.body.thread_id,
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

// I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields as in POST.

exports.getAllReplies = async function(request, response) {
  let replies;

  if (await boardController.validateBoard(request.params.board)) {
    replies = Replies(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  const replyDocs = await replies
        .find({'thread_id': request.query.thread_id})
        .exec();

  const returnReplies = replyDocs.map((doc) => {
    return {
      _id: doc._id,
      text: doc.text,
      thread_id: doc.thread_id,
      created_on: doc.created_on,
      reported: doc.reported
    };
  });

  return response
    .status(200)
    .send(returnReplies);
};

// I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. (Text response will be 'success')

exports.putReportReply = async function(request, response) {
  let replies;

  if (await boardController.validateBoard(request.params.board)) {
    replies = Replies(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  const reply = await replies.findOneAndUpdate({
    '_id': request.body.reply_id,
    'thread_id': request.body.thread_id
  }, {'reported': false}).exec();

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

exports.deleteReply = async function(request, response) {
  let replies;

  if (await boardController.validateBoard(request.params.board)) {
    replies = Replies(request.params.board);
  } else {
    // Re-render form with invalid board error.
    return response.redirect('/');
  }

  let reply = await replies.findOne({
    '_id': request.body.reply_id,
    'thread_id': request.body.thread_id
  }).exec();

  if (reply.delete_password === request.body.delete_password) {
     reply = await replies.findOneAndUpdate({
       '_id': request.body.reply_id,
       'thread_id': request.body.thread_id
     }, {'text': '[deleted]'}).exec();


    if (reply) {
      return response
        .status(200)
        .send('success');
    } else {
      return response
        .status(400)
        .send('failure');
    }
  } else {
    return response
      .status(400)
      .send('incorrect password');
  }
};
