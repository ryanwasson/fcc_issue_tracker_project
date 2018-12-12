/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var Mongoose = require('mongoose');

//Database connection and schema details

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
Mongoose.connect(CONNECTION_STRING);

//define mongoose schema
let issueSchema = Mongoose.Schema({
  'issue_title': String, 
  'issue_text': String, 
  'created_by': String,
  'assigned_to': String,
  'status_text': String,
  'project': String,
  'created_on': Date,
  'updated_on': Date,
  'open': Boolean
});

//define mongoose model
let Issue = Mongoose.model('Issue',issueSchema,'Issues');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var properties = req.query ;
      properties.project = project ;
    
      Issue.find(properties, function(err,data) {
        if (err) return res.json({error: err});
        else {
          if (data.length > 0) {
          return res.json(data.map(d => ({project: project,
                             issue_title: d.issue_title,
                             issue_text: d.issue_text,
                             created_by: d.created_by,
                             assigned_to: d.assigned_to == undefined ? '' : d.assigned_to,
                             status_text: d.status_text == undefined ? '' : d.status_text,
                             created_on: d.created_on,
                             updated_on: d.updated_on,
                             open: d.open,
                             _id: d._id
                             }))) ;
          }
          else return res.json([]);
        }
      })
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issueTitle = req.body.issue_title;
      var issueText = req.body.issue_text ;
      var createdBy = req.body.created_by ;
      var assignedTo = req.body.assigned_to ;
      var statusText = req.body.status_text ;
      var timestamp = new Date() ;
    
      if (issueTitle == undefined || issueText == undefined || createdBy == undefined) 
        return res.json({error: 'missing required fields'}) ;
      
      var newIssue = new Issue({issue_title: issueTitle,
                                issue_text: issueText,
                                created_by: createdBy,
                                assigned_to: assignedTo == undefined ? '' : assignedTo,
                                status_text: statusText == undefined ? '' : statusText,
                                project: project,
                                'created_on': timestamp,
                                'updated_on': timestamp,
                                'open': true
                               });
      newIssue.save(function(err,data) {
        if (err) return console.log(err);
        else {
          return res.json(data);
        }
      });
    
    })
    
    .put(function (req, res){
      var objectFields = req.body ;
    
      //check if empty
      var isEmpty = true ;
    
      for (var property in objectFields) {
        if (objectFields.hasOwnProperty(property)) {
          isEmpty = false ;
          break ;
        }
      }
    
      if (isEmpty) return res.json({error: 'no updated fields sent'}) ;
    
      Issue.findById(objectFields, function(err,issue) {
        if (err) console.log(err) ;
        else {
          //console.log(issue) ;
          if (issue != null) {
           for (var property in objectFields) {
              if (objectFields.hasOwnProperty(property) && property != 'project' && property != '_id') {
                issue[property] = objectFields[property] ;
              }
            }
          
            issue.updated_on = new Date() ;
          
            issue.save(function(err,data) {
              if (err) res.json({error: 'could not update' + objectFields._id + ' due to error'}) ;
              else res.json({success: 'successfully updated issue in db'});
            });
          }
          else console.log('could not update issue because could not find it in the db');
        }
      }) ;
      
    })
    
    .delete(function (req, res){
      var objectFields = req.body ;
    
      var noId = true ;
      for (var property in objectFields) {
        if (objectFields.hasOwnProperty(property) && property == '_id') {
            noId = false ;
            break ;
        }
      }
      if (noId) return res.json({error: '_id error (missing _id)'}) ;
    
      Issue.remove(objectFields, function(err,issue) {
        if (err) res.json({failed: 'could not delete ' + objectFields._id + ' due to the error: ' + err});
        else res.json({success: 'deleted: ' + objectFields._id}) ;
      });
    });
    
};
