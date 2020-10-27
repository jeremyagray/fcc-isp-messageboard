'use strict';

const mongoose = require('mongoose');

// Create a threa schema and model.
const threadSchema = new mongoose.Schema(
  {
    text: {type: String, required: true},
    delete_password: {type: String, required: true},
    created_on: {type: Date, required: true, default: Date.now},
    bumped_on: {type: Date, required: true, default: Date.now},
    reported: {type: Boolean, required: true, default: false}
  });

// Add a virtual to populate replies into their thread.
threadSchema.virtual('replies', {
  ref: 'Reply',
  localField: '_id',
  foreignField: 'replyId',
  justOne: false
});

// const threadModel = mongoose.model('Thread', threadSchema);

function threadModel(board) {
  return mongoose.model(`${board}Thread`, threadSchema);
}

module.exports = threadModel;
