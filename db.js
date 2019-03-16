module.exports = (function() {
    'use strict';
    var router = require('express').Router();
    var mysql = require('mysql');
   var con = mysql.createConnection({
  host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
  user     : 'rd_live',
  password : 'reeldeal1',
  database : 'reeldeal',
  port     : process.env.RDS_PORT
});

con.connect(function(err) {
    if (err) throw err;
});

    return router;
});