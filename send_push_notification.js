module.exports = {

convert_to_string:function convert_to_string(int_value)
                   {
					 if(int_value===null || int_value=="" || int_value===undefined)
					 {
						 converted_string="";
					 }
                     else
					 {
						  var converted_string=int_value.toString();
					 }  
	                 
	                 return converted_string;
                   },
				   
				   
  push:function push (user_id,new_chat_detail_id,chat_room_id){
	
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
  var admin = require('firebase-admin');
  var serviceAccount = require('./fcm.json');
 
	
	
	var sql="SELECT * FROM users where user_id=" +user_id;
	
	con.query(sql,function(error,result){
		var receiver_push_id=result[0].push_notification;
		var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +new_chat_detail_id;
		con.query(sql,function(error,result){
			
			 var registrationToken =receiver_push_id;
			 if(registrationToken!="")
			 {
			 // data to convert in string
			var chat_detail_id   =  module.exports.convert_to_string(result[0].chat_detail_id);
			var chat_room_id     =  module.exports.convert_to_string(result[0].chat_room_id);
            var sender_id        =  module.exports.convert_to_string(result[0].sender_id);
            var receiver_id      =  module.exports.convert_to_string(result[0].receiver_id);
            var sent_at          =  module.exports.convert_to_string(result[0].sent_at);
            var delivered_at     =  module.exports.convert_to_string(result[0].delivered_at);
            var seen_at          =  module.exports.convert_to_string(result[0].seen_at);
            var attachment_type  =  module.exports.convert_to_string(result[0].attachment_type);
   			var attachment_url   =  module.exports.convert_to_string(result[0].attachment_url);
			var message_status   =  module.exports.convert_to_string(result[0].message_status);
			var created_at       =  module.exports.convert_to_string(result[0].created_at);
			var updated_at       =  module.exports.convert_to_string(result[0].created_at);
			var image_url        =  result[0].image_url;
			var text             =  result[0].text;
			if(image_url===undefined || image_url=="" || image_url ===null)  
			{
				image_url="";
			}
			
			if(text===undefined || text=="" || text===null)
			{
				text="";
			}
			
			// checking for how many unread messages are left for this user
             var sql="SELECT * FROM chat_details WHERE chat_room_id=" +chat_room_id + " AND seen_at IS NULL;";
			 con.query(sql,function(err,res){
		      
			 var unread_messages=res.length;
			 console.log("result ->" res.length);
			 var badge_to_android=module.exports.convert_to_string(unread_messages);
			 var data={name:result[0].name,"image_url":image_url,"text":text,"chat_detail_id":chat_detail_id,
			 chat_room_id:chat_room_id,sender_id:sender_id,receiver_id:receiver_id,sent_at:sent_at,delivered_at:delivered_at,seen_at:seen_at,attachment_type:attachment_type,attachment_url:attachment_url,message_status:message_status,created_at,created_at,updated_at,type:"chat",badge:badge_to_android};
			 
			 
             var message = {

             data:data,
             token: registrationToken,
			
                apns: {               // sending push notification for apple devices
                payload: {
                     aps: {
                           badge:unread_messages,
						   alert: {
                                    title:result[0].name,
                                    body:result[0].text,
                                  },
                          },
                        },
                     },
             };

             admin.messaging().send(message)
            .then((response) => {
    
              console.log('Successfully sent message:', response);
              })
              .catch((error) => {
               console.log('Error sending message:', error);
              });
			  con.end();
			});
		   }	
		});
	    
	});
 },
 
  
 
 


};