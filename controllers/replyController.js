'use strict';

// const Boards = require('../models/boards.js');
const Threads = require('../models/threads.js');
const Replies = require('../models/replies.js');

exports.getReplies = async function(board, threadId, num) {
  let replyModel = Replies(board);
  let replies = await replyModel
      .find({thread_id: threadId})
      .sort({created_on: 'asc'})
      .exec();

  // console.log(replies);
  if (replies === null) {
    // console.log('no replies');
    return [];
  } else {
    let items = 0;

    // console.log(`${replies.length} replies`);
    // Set number of replies to return.
    if (replies.length > num) {
      items = num;
    } else {
      items = replies.length;
    }

    let ids = [];
    for (let i = 0; i < items; i++)
    {
      ids.push(replies[i]._id);
    }

    return ids;
  }
}
