'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../../utils');
const config = require('../../../config');
const spawn = require('child_process').spawn;
const assign = Object.assign;
const MongoClient = require('mongodb').MongoClient,
test = require('assert');


// Connection url
var url = config.db;
var databases;
// Connect using MongoClient
MongoClient.connect(url, function(err, db) {
  // Use the admin database for the operation
  var adminDb = db.admin();
  // List all the available databases
  adminDb.listDatabases(function(err, dbs) {
    test.equal(null, err);
    test.ok(dbs.databases.length > 0);
    databases = dbs.databases;
    db.close();
  });
});

/**
 * List
 */

exports.index = async(function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 30;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const dbs = databases;
  const count = databases.length;

  var child = {};

  const docker = spawn('docker', ['exec', '-i', 'projeto_mongo1_1']);

  // const cli = spawn('mongo', ['--eval', '\'rs.status();\'']);

  // docker.stdout.on('data', function(data) {
  //   mongo.stdin.write(data);
  // });

  // docker.stderr.on('data', function(data) {
  //   console.log(`docker stderr: ${data}`);
  // });

  // docker.on('close', function(code) {
  //   if (code !== 0) {
  //     console.log(`docker process exited with code ${code}`);
  //   }
  //   mongo.stdin.end();
  // });

  // mongo.stdout.on('data', function(data) {
  //   console.log(data.toString());
  // });

  // mongo.stderr.on('data', function(data) {
  //   console.log(`mongo stderr: ${data}`);
  // });

  // mongo.on('close', function(code) {
  //   if (code !== 0) {
  //     console.log(`grep process exited with code ${code}`);
  //   }
  // });

  respond(res, 'admin/dbs/index', {
    title: 'Dbs',
    dbs: dbs,
    page: page + 1,
    child: child,
    pages: Math.ceil(count / limit)
  });
});

// /**
//  * New book
//  */

// exports.new = function (req, res){
//   res.render('books/new', {
//     title: 'New Book',
//     book: new Book()
//   });
// };

// /**
//  * Create an book
//  * Upload an image
//  */

// exports.create = async(function* (req, res) {
//   const book = new Book(only(req.body, 'title description tags'));
//   book.user = req.user;
//   try {
//     yield book.uploadAndSave(req.file);
//     respondOrRedirect({ req, res }, `/books/${book._id}`, book, {
//       type: 'success',
//       text: 'Successfully created book!'
//     });
//   } catch (err) {
//     respond(res, 'books/new', {
//       title: book.title || 'New Book',
//       errors: [err.toString()],
//       book
//     }, 422);
//   }
// });

// /**
//  * Edit an book
//  */

// exports.edit = function (req, res) {
//   res.render('books/edit', {
//     title: 'Edit ' + req.book.title,
//     book: req.book
//   });
// };

// /**
//  * Update book
//  */

// exports.update = async(function* (req, res){
//   const book = req.book;
//   assign(book, only(req.body, 'title description tags'));
//   try {
//     yield book.uploadAndSave(req.file);
//     respondOrRedirect({ res }, `/books/${book._id}`, book);
//   } catch (err) {
//     respond(res, 'books/edit', {
//       title: 'Edit ' + book.title,
//       errors: [err.toString()],
//       book
//     }, 422);
//   }
// });

// /**
//  * Show
//  */

// exports.show = function (req, res){
//   respond(res, 'books/show', {
//     title: req.book.title,
//     book: req.book
//   });
// };

// /**
//  * Delete an book
//  */

// exports.destroy = async(function* (req, res) {
//   yield req.book.remove();
//   respondOrRedirect({ req, res }, '/books', {}, {
//     type: 'info',
//     text: 'Deleted successfully'
//   });
// });
