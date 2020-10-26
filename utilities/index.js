'use strict';

const mongoose = require('mongoose');

// Modified from:  https://stackoverflow.com/a/679937
function isEmpty(object)
{
  for (let property in object)
  {
    if(object.hasOwnProperty(property))
    {
      return false;
    }
  }

  return true;
}

function getValidField(field, json)
{
  return (json.hasOwnProperty(field) && json[field] != '') ? json[field] : null;
}

function isValidId(str)
{
  if (str === null
      || str === undefined
      || str === ''
      || str.length != 24)
  {
    return false;
  }
  // Not hexadecimal.
  else if (! /^[0-9a-f]{24}$/.test(str.toLowerCase()))
  {
    return false;
  }
  else
  {
    return new mongoose.Types.ObjectId(str).toString() === str;
  }
}

module.exports = {getValidField, isEmpty, isValidId};
