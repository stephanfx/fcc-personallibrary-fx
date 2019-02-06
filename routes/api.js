/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log('DB Connection Error: ', err);
          }
          
          db.collection('books').find({}, {
              fields: {_id: 1, title: 1, commentcount: 1}
            }, (err, docs) => {
            if (err) {
              return res.send('Error getting from to DB: ', err);
            }
            docs.toArray().then(results => {
              res.json(results);
              db.close();
            });  
          });          
        });      
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (!title){
        return res.status(400).json('Title is required');
      }
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log('DB Connection Error: ', err);
          }
          
          db.collection('books').insertOne({
            title,
            commentcount: 0,
            comments: []
            
          }, (err, doc) => {
             if (err) {
              return res.send('Error saving to DB: ', err);
             }
            //response will contain new book object including atleast _id and title
            res.json(doc.ops[0]);
          });
          db.close();
        });     
      
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log('DB Connection Error: ', err);
          }
          
          db.collection('books').deleteMany({}, (err, docs) => {
            if (err) {
              return res.send('Error getting from to DB: ', err);
            }
            res.json('complete delete successful');
            db.close();
          });          
        });
      
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log('DB Connection Error: ', err);
          }
          
          db.collection('books').findOne({_id: ObjectId(bookid)}, (err, docs) => {
            if (err) {
              return res.send('Error on DB:', err);
            }
            if (null === docs) {
              res.status(404).json('no book exists');
            } else {
              res.json(docs);
            }
            db.close();
          });          
        });   
      
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log('DB Connection Error: ', err);
          }   
          
          try{
            db.collection('books').findOneAndUpdate(
              {_id: ObjectId(bookid)}, // filter
              {
                '$inc': {'commentcount': 1}, 
                '$push':{'comments': comment}
              }, // update
              {
                'returnOriginal': false
              }, (err, doc) => {
                if (err) {
                  console.log('Error: ', err);
                  return res.json('could not update ' + bookid);
                }
                res.json(doc.value);
                db.close();              
            });
          } catch(e) {
            print(e);
          }
          
        });     
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) {
            console.log('DB Connection Error: ', err);
          }   
          
          db.collection('books').deleteOne({_id: ObjectId(bookid)}, (err, doc) => {
             if (err) {
              return res.json('could not delete ' + bookid);
             }
              res.json('delete successful');
          });
          db.close();
        });  
      //if successful response will be 'delete successful'      
    });
  
};
