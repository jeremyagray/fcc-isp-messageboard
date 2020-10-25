'use strict';

const Boards = require('../models/boards.js');

exports.validateBoard = async function(board)
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
