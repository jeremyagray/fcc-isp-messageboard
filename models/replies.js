'use strict';

const mongoose = require('mongoose');

// Create a reply schema and model.
const replySchema = new mongoose.Schema(
  {
    text: {type: String, required: true},
    delete_password: {type: String, required: true},
    thread_id: {type: mongoose.ObjectId, required: true},
    created_on: {type: Date, required: true, default: Date.now},
    reported: {type: Boolean, required: true, default: false}
  });

function replyModel(board) {
  return mongoose.model(`${board}Reply`, replySchema);
}

module.exports = replyModel;
