var express=require("express");
var app=express();
var mysql = require('mysql');
var http=require("http").Server(app);
var io=require("socket.io")(http);

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.use("/socket",express.static("socket")); // socket folder
var events=require("./events.js")(io);
app.use("/",events);

var delete_chat_room        =   require("./delete_chat_room.js");
var delete_chat_details     =   require("./delete_chat_details");
var send_push_notification  =   require("./send_push_notification.js");


app.get('/', (req, res) => {
  res.sendFile("test.html",{root:'./'});
});






/////////////////////Test api starts /////////////////////////////////// used only for testing
app.get("/delete_chat_room_with_chat_room_id",function(req,res){
	      var chat_room_id =  req.query.chat_room_id;
		 delete_chat_room.delete_chat_room(chat_room_id);  // it will delete all the rows whose chat_room_id is something
		 // from the table chat_room
		 delete_chat_details.delete_chat_details_with_chat_room_id(chat_room_id);
		 res.json({"status":"success"});
});

app.get("/delete_chat_room_with_user_id",function(req,res){
	
	     var user_id=req.query.user_id;
		 delete_chat_room.delete_chat_room_with_user_id(user_id);
		 delete_chat_details.delete_chat_details_with_user_id(user_id);
		 res.json({"status":"success"});
});

app.get("/send_push_test",function(req,res){
	var user_id=req.query.user_id;
	console.log("user_id-->" +user_id);
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
  var unread_messages=4;
  var sql="Select * from users WHERE user_id=" +user_id;
  con.query(sql,function(error,result){
	  
	  if (error) throw error;
	  
	  var receiver_push_id=result[0].push_notification;
	  console.log(receiver_push_id);
	  var registrationToken =receiver_push_id;

              var message = {
				/* 
				 notification: {
                 title: result[0].name, //name of sender
                 body: result[0].text
                 }, */
             data:{'msg':'Hello'},
			 token: registrationToken,
			
                apns: {               // sending push notification for apple devices
                payload: {
                     aps: {
                           badge:unread_messages,
						   alert: {
                                    title:'Test title',
                                    body:'Test body',
                                  },
                          },
                        },
                     },
             };
            

             admin.messaging().send(message)
            .then((response) => {
    
              console.log('Successfully sent message:', response);
			  res.send('Successfully sent message:' +response);
              })
              .catch((error) => {
               console.log('Error sending message:', error);
			  res.send('Error sending message:', +error);
              });
  
  });

});
 /////////////////////Test api ends ///////////////////////////////////////////////////
 
 
 
 
 
 
 

http.listen(3000, () => console.log('Server running on port 3000'));