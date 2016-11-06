'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');
const { respondOrRedirect } = require('../utils');

/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  req.comment = req.book.comments
    .find(comment => comment.id === id);

  if (!req.comment) return next(new Error('Comment not found'));
  next();
};

/**
 * Create comment
 */

exports.create = async(function* (req, res) {
  const book = req.book;
  yield book.addComment(req.user, req.body);
  respondOrRedirect({ res }, `/books/${book._id}`, book.comments[0]);
});

/**
 * Delete comment
 */

exports.destroy = async(function* (req, res) {
  yield req.book.removeComment(req.params.commentId);
  req.flash('info', 'Removed comment');
  res.redirect('/books/' + req.book.id);
  respondOrRedirect({ req, res }, `/books/${req.book.id}`, {}, {
    type: 'info',
    text: 'Removed comment'
  });
});
