'use strict';

const mongoose = require('mongoose');

// Modified from:  https://stackoverflow.com/a/679937
// Return true if object is an object and has no properties.
// Otherwise, return false.
function isEmpty(object) {
  if (typeof object !== 'string'
      && typeof object !== 'number'
      && typeof object !== 'boolean'
      && typeof object !== 'undefined'
      && object !== null
      && object !== undefined
      && object !== '') {
    for (let property in object) {
      if(Object.hasOwnProperty.call(object, property)) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}

// Get an object property (JSON field) if field exists, is not the
// empty string, is not null, and is not undefined.
function getValidField(field, obj) {
  return (Object.hasOwnProperty.call(obj, field)
          && obj[field] !== ''
          && obj[field] !== null
          && obj[field] !== undefined) ? obj[field] : null;
}

// Validate a string as a possible Mongoose.ObjectId.
// str should not be null, undefined, empty, or not 24 characters
// long.  str should be in hexadecimal.  str should equal `new
// mongoose.Types.ObjectId(str).toString()`.
function isValidId(str) {
  if (str === null
      || str === undefined
      || str === ''
      || str.length != 24) {
    return false;
  } else if (! /^[0-9a-f]{24}$/.test(str.toLowerCase())) {
    // Not hexadecimal.
    return false;
  } else {
    return new mongoose.Types.ObjectId(str).toString() === str;
  }
}

module.exports = {getValidField, isEmpty, isValidId};
