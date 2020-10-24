'use strict';

const mongoose = require('mongoose');

// Create a board schema and model.
const boardSchema = new mongoose.Schema(
  {
    board: {type: String, required: true},
    created: {type: Date, required: true, default: Date.now}
  });

const boardModel = mongoose.model('Board', boardSchema);

module.exports = boardModel;
