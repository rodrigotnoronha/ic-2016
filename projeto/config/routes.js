'use strict';

/*
 * Module dependencies.
 */

const users = require('../app/controllers/users');
const books = require('../app/controllers/books');
const comments = require('../app/controllers/comments');
const admin_dbs = require('../app/controllers/admin/dbs');
const tags = require('../app/controllers/tags');
const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

const bookAuth = [auth.requiresLogin, auth.book.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];
const userAuth = [auth.requiresLogin, auth.user.hasAuthorization];

const adminDbsAuth = [auth.requiresLogin, auth.admin_dbs.hasAuthorization];



const fail = {
  failureRedirect: '/login'
};

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  const pauth = passport.authenticate.bind(passport);

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.get('/users/:userId/edit', userAuth, users.edit);
  app.put('/users/:userId', userAuth, users.update);
  app.post('/users/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);
  app.get('/users/:userId', users.show);
  app.get('/auth/facebook',
    pauth('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/facebook/callback', pauth('facebook', fail), users.authCallback);
  app.get('/auth/github', pauth('github', fail), users.signin);
  app.get('/auth/github/callback', pauth('github', fail), users.authCallback);
  app.get('/auth/twitter', pauth('twitter', fail), users.signin);
  app.get('/auth/twitter/callback', pauth('twitter', fail), users.authCallback);
  app.get('/auth/google',
    pauth('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);
  app.get('/auth/google/callback', pauth('google', fail), users.authCallback);
  app.get('/auth/linkedin',
    pauth('linkedin', {
      failureRedirect: '/login',
      scope: [
        'r_emailaddress'
      ]
    }), users.signin);
  app.get('/auth/linkedin/callback', pauth('linkedin', fail), users.authCallback);

  app.param('userId', users.load);

  // book routes
  app.param('id', books.load);
  app.get('/books', books.index);
  app.get('/books/new', auth.requiresLogin, books.new);
  app.post('/books', auth.requiresLogin, books.create);
  app.get('/books/:id', books.show);
  app.get('/books/:id/edit', bookAuth, books.edit);
  app.put('/books/:id', bookAuth, books.update);
  app.delete('/books/:id', bookAuth, books.destroy);

  // home route
  app.get('/', books.index);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/books/:id/comments', auth.requiresLogin, comments.create);
  app.get('/books/:id/comments', auth.requiresLogin, comments.create);
  app.delete('/books/:id/comments/:commentId', commentAuth, comments.destroy);

  // tag routes
  app.get('/tags/:tag', tags.index);

  // # ADMIN ROUTES
   app.get('/admin/dbs', admin_dbs.index);


  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};
