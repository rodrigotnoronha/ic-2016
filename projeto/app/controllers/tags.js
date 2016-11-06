'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respond } = require('../utils');
const Book = mongoose.model('Book');

/**
 * List items tagged with a tag
 */

exports.index = async(function* (req, res) {
  const criteria = { tags: req.params.tag };
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const limit = 30;
  const options = {
    limit: limit,
    page: page,
    criteria: criteria
  };

  const books = yield Book.list(options);
  const count = yield Book.count(criteria);

  respond(res, 'books/index', {
    title: 'Books tagged ' + req.params.tag,
    books: books,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});
