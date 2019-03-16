module.exports = {
	

	delete_chat_details_with_user_id:function(user_id)
	                                {
		                               var mysql = require('mysql');
                                       var moment = require('moment');
                                       var con=require("./db.js");
                                       var con = mysql.createConnection({
                                       host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
                                       user     : 'rd_live',
                                       password : 'reeldeal1',
                                       database : 'reeldeal',
                                       port     : process.env.RDS_PORT
                                       });
									   
									   var sql="DELETE FROM chat_details WHERE sender_id=" +user_id;
									   con.query(sql,function(error,result){
										   if(error) throw error;
										   console.log("Deleted from chat_details table");
 									   });
									   
	                                },
									
		delete_chat_details_with_chat_room_id:function(chat_room_id)
		                                      {
												   var mysql = require('mysql');
                                                   var moment = require('moment');
                                                   var con=require("./db.js");
                                                   var con = mysql.createConnection({
                                                   host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
                                                   user     : 'rd_live',
                                                   password : 'reeldeal1',
                                                   database : 'reeldeal',
                                                   port     : process.env.RDS_PORT
                                                   });
												   
												 var sql="DELETE FROM chat_details WHERE chat_room_id=" +chat_room_id;
                                                 con.query(sql,function(error,result){
													 if(error) throw error;
													 console.log("Deleted from chat_details table");
												 });												 
											  }		
									
	
	
};