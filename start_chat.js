module.exports = (function(io) {
    'use strict';
  var router = require('express').Router();
   var con=require("./db.js");
   var mysql = require('mysql');
   var con = mysql.createConnection({
  host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
  user     : 'rd_live',
  password : 'reeldeal1',
  database : 'reeldeal',
  port     : process.env.RDS_PORT
}); 

 var moment = require('moment');
 var admin = require('firebase-admin');
var serviceAccount = require('./fcm.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});
 
 
 
var FCM = require('fcm-push');
var serverKey = 'AAAA6doebNY:APA91bH4qRXeJlxKja_Vhk5QvNMrzyA8OTN9QOYLYkJ01J5ky7lqSL4wv85-QPFOoWyJcrqAZIJeykvBy29iOhIz3-INXWT44agiQzajQ_mVH3b9P0Jas6_h30CV_uKYSj80e0GvOVfP';
var fcm = new FCM(serverKey); 

function push_notification(user_id,result_object)
{
	console.log("called push notification" +user_id);
	var sql="SELECT * FROM users where user_id=" +user_id;
	con.query(sql,function(error,result){
	    var receiver_push_id=result[0].push_notification;
		console.log("result_object-->" +result_object);
		// This registration token comes from the client FCM SDKs.
var registrationToken =receiver_push_id;

// See documentation on defining a message payload.
var message = {
  data:result_object,
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
		/*
		arr.push(receiver_push_id);
		console.log("receiver_push_id---->" +receiver_push_id);
		        var message = {
                to:arr, // required fill with device token or topics
                collapse_key: 'com.aktion.reeldeal', 
				priority: 'high',
                data:'',
              notification: {
              title: 'New message arrives',
               body: 'This is a body of push notification'
              }
            };

            //callback style
           fcm.send(message, function(err, response){
           if (err) {
              console.log("Something has gone wrong!" +err);
          } else {
              console.log("Successfully sent with response: ", response);
                 }
            });
		
		*/
   });
	
}






function update_or_insert_chat_master(chat_room_id,user_id,s_id)
{
     
        console.log(chat_room_id + " " +user_id + " "+ s_id);		
        
		// check if user_id && chat_room_id are present
		
		var sql="SELECT * FROM chat_master WHERE socket_id=" +s_id + " AND user_id=" +user_id;
		con.query(sql,function(error,result){
			if(result.length==0)
			{   console.log("result length 0");
				// agar vo pehli baar room create ker raha hai
				// insert kerna hai  table me
				
				var sql2="INSERT INTO chat_master SET ?";
				var value2={
					"status":1,
					"user_id":user_id,
					"chat_room_id":-1,
					"socket_id":s_id
				}
				con.query(sql2,value2,function(er2,re2){
	                    // response dena hai server...un sab ki user_id jinki chat_room_id ai hai
                        var sql3="SELECT * FROM chat_master WHERE chat_room_id=" +chat_room_id;
						con.query(sql3,function(er3,re3){
							   console.log(re3);
							  // socket.emit("connected",re3);
						});
				})
				
			}
			else
			{   console.log("not0");
				var sql = "UPDATE chat_master SET socket_id='" +s_id+ "' ,status=1 WHERE user_id="+user_id;
                   con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("record updated" +result.affectedRows);
	                
                  }); 
				
				
				// response dena hai server...un sab ki user_id jinki chat_room_id ai hai
                        var sql3="SELECT * FROM chat_master WHERE chat_room_id=" +chat_room_id;
						con.query(sql3,function(er3,re3){
							   console.log(re3);
							  // socket.emit("connected",re3);
						});
			}
		});
		
		
		
	
}




 io.on("connection",function(socket){
	 // console.log("socket connected" +socket.id);
	  var user_id=socket.handshake.query.user_id;
	  var socket_id=socket.id;
	  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	  var sql="INSERT INTO chat_master SET ?";
	  var values={
		  "chat_room_id":-1,
		  "user_id":user_id,
		  "socket_id":socket_id,
		  "status":1,
		  "created_at":mysqlTimestamp,
		  "updated_at":mysqlTimestamp
	  }
	  con.query(sql,values,function(error,result){
		  console.log(result);
	  });
	  
	 
	 socket.on("test_push",function(packet){
		 
		 var user_id=packet.user_id;
		 push_notification(user_id);
		 
	 });
	 
 function send_notification_or_message(user_id,result)
{ 
	var sql3="SELECT * FROM chat_master WHERE user_id=" +user_id;
		con.query(sql3,function(er3,re3){
													
			var user_socket_id=re3[0].socket_id;
			
			if(re3[0].status==0) // user is offline send push notification
			{
				push_notification(user_id,result);
			}
			else  // user is online send the object
			{
				for(var i=0;i<re3[0].length;i++)
				{
				console.log("send socket message user_socket_id is " +user_socket_id);
			    socket.broadcast.to(re3[i].socket_id).emit('new_message',result);
				}
			}
													
			})
}
	 
	 
	 socket.on("connected",function(packet){
		
         var chat_room_id=packet.chat_room_id;
		 var user_id=packet.user_id;
         var s_id=socket.id;
        console.log(chat_room_id + " " +user_id + " "+ s_id);		
        
		// check if user_id && chat_room_id are present
		
		var sql="SELECT * FROM chat_master WHERE chat_room_id=" +chat_room_id + " AND user_id=" +user_id;
		con.query(sql,function(error,result){
			if(result.length==0)
			{   console.log("result length 0");
				// agar vo pehli baar room create ker raha hai
				// insert kerna hai  table me
				
				var sql2="INSERT INTO chat_master SET ?";
				var value2={
					"status":1,
					"user_id":user_id,
					"chat_room_id":chat_room_id,
					"socket_id":s_id
				}
				con.query(sql2,value2,function(er2,re2){
	                    // response dena hai server...un sab ki user_id jinki chat_room_id ai hai
                        var sql3="SELECT * FROM chat_master WHERE chat_room_id=" +chat_room_id;
						con.query(sql3,function(er3,re3){
							   console.log(re3);
							   socket.emit("connected",re3);
						});
				})
				
			}
			else
			{   console.log("not0");
				var sql = "UPDATE chat_master SET socket_id='" +s_id+ "' ,status=1 WHERE user_id="+user_id;
                   con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("record updated" +result.affectedRows);
	                
                  }); 
				
				
				// response dena hai server...un sab ki user_id jinki chat_room_id ai hai
                        var sql3="SELECT * FROM chat_master WHERE chat_room_id=" +chat_room_id;
						con.query(sql3,function(er3,re3){
							   console.log(re3);
							   socket.emit("connected",re3);
						});
			}
		});
		
		
		
        
	 });
	
	  
	  
	  socket.on("start_chat",function(packet){
		 
		  var chat_id=packet.chat_room_id;
		  var item_id=packet.item_id;
		  var buyer_id=packet.buyer_id; // client se ayega
		  var seller_id=packet.seller_id; // client se ayega
		  var sender_id=packet.sender_id;
		//  var receiver_id=packet.receiver_id;
		 // var receiver_socket_id=packet.receiver_socket_id;
		  var text=packet.text;
		  console.log(chat_id + " " +item_id + " " +buyer_id + " " +seller_id + " " +sender_id);
		  
		 if(chat_id===undefined || !chat_id)
         { 			 
		con.connect(function(err) {
        var sql = "INSERT INTO chat_room  SET ?";
	    var values={
		          'item_id':item_id,
				  'buyer_id':buyer_id,
				  'seller_id':seller_id
	              } 
	             
              con.query(sql,values, function (err, result) {
              if (err) throw err;
                     console.log(result.insertId);
					 var ch=result.insertId
					 var sql2="INSERT INTO chat_details  SET ?";
					 var values2={
		                           'chat_room_id':result.insertId,
				                     'text':text,
									 
				 
	                               } 
	                con.query(sql2,values2, function (err, result,fields) {
                     if (err) throw err;
					
					                        // newly result client ko dene ke liye
                                            console.log("result ki insert id: "+result.insertId);
					                        var sql="Select * FROM chat_details WHERE chat_detail_id=" +result.insertId;
		                                    con.query(sql,function(er4,re4){
			                              
		                                     var result_object=re4;
											 
											 // chat room me broadcast kerne ke liye
											 var sql6="SELECT * FROM chat_master WHERE chat_room_id=" +result_object[0].chat_room_id;
											 
											 con.query(sql6,function(er6,re6){
												 console.log(re6);
												var chat_master_table_details=re6;
												 
												 // ye query users ke name , profile_image , push notification ke liye hai
												 var sql7="SELECT * FROM users WHERE user_id=" +sender_id;
												 con.query(sql7,function(er7,re7){
													 result_object.sender_name=re7[0].name;
													 result_object.sender_image_url=re7[0].image_url;
													 for(var i=0;i<re6.length;i++)
													 {
													   if(re6[i].status==1) // it means user online hai tab direct send karo
													   {
													   socket.broadcast.to(re6[i].socket_id).emit("new_message",result_object);
													   }
                                                       else // it means user offline hai then send push noti
													   {
														   //send a push notification
														  
														  console.log(user_id + " " +result_object);
														   //push_notification(user_id,result_object);
														   
													   }														   
													 }
													 
												 });
											 });
											 
											 
		                                     });
					                        //
					 
					 
					         //chat room wali table me bhi insert kerna hai
					        var sql_1="INSERT INTO chat_room SET ?";
					         var data={
								          'chat_room_id':ch,
						                 'item_id':item_id,
				                         'buyer_id':buyer_id,
				                         'seller_id':seller_id,
										 'status'   :1            // 1 for active 0 for deleted
					                  }
						   con.query(sql_1,data,function(err,resu){
							     //console.log(resu.insertId + " inserted in chat_room");
						   });
					  
                    });
             });
      });
	   }
	  
 
 
	  }); // start chat ends 
	  
	  
	  
	  
	  
	  socket.on("create_chat_room",function(packet){
		  
		  var chat_room_id=packet.chat_room_id;
		  var buyer_id=packet.buyer_id;
		  var seller_id=packet.seller_id;
		  var item_id=packet.item_id;
		  var s_id=socket.id;
		  console.log(chat_room_id + " " +buyer_id + " " +seller_id + " " +item_id);
		  if(chat_room_id===undefined || !chat_room_id )
		  {
			  // chat table has comb of item_id buyer_id seller_id
			  // get chat_room_id from chat_room table
			  var sql="SELECT * FROM chat_room WHERE item_id=" +item_id + " AND seller_id=" +seller_id + " AND buyer_id=" +buyer_id+";";
			  
			  con.query(sql,function(error,result){
				 console.log("chat_room table me se check kiya -->" +result.length)
				 if(result.length != 0) // combination exsist
				 { console.log("comination exsist");
					 var chat_room_id=result[0].chat_room_id; 
					// update_or_insert_chat_master(-1,buyer_id,s_id);
					 socket.emit("user_joined",{chat_room_id:chat_room_id});
				 }
				 else   //combination doesn't exsist
				 {
					  console.log("combination doesn't exsist");
					   var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
					 var sql2="INSERT INTO chat_room SET ?";
					 var values={
						  'item_id':item_id,
				          'buyer_id':buyer_id,
				          'seller_id':seller_id,
						  'created_at':time,
						  'updated_at':time
						  
					 }
					 con.query(sql2,values,function(er2,re2){
						 //console.log(re2);
						var inserted_chat_room_id=re2.insertId;
						//update_or_insert_chat_master(-1,buyer_id,s_id);
                          socket.emit("user_joined",{chat_room_id:inserted_chat_room_id});
					 });
				 } 

			  });
			 
		  }
		  else
		  {
			  
		  }
		  
	  });
	  
	  
	  socket.on("new_message",function(packet){
		  
		  var chat_room_id=packet.chat_room_id;
		  var sender_id=packet.sender_id;
		  var text=packet.text;
		  
		  // direct insert kerna hai 
		   console.log("not null(0) direct chat_details wlai table me insert kerna hai");
		  var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		  
		   var sql3="INSERT INTO chat_details SET ?";
		   var values3={
			            'chat_room_id':chat_room_id,
						'sender_id'   :sender_id,
						//'receiver_id' :receiver_id,
						'text'        :text,
						'sent_at'     :time,
					'message_status'  :0,
					'created_at'      :time,
                    'updated_at'      :time					
		   }
		   con.query(sql3,values3, function (err, result) {
                     if (err) throw err;
					 //socket.broadcast.to(receiver_socket_id).emit("start_chat",result); 
                      console.log(result.insertId);
					  
					  // newly result client ko dene ke liye
                                            console.log("result ki insert id: "+result.insertId);
					                        var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +result.insertId;
		                                    con.query(sql,function(er4,re4){
			                                 
                          
		                                     var chat_room_id=re4[0].chat_room_id;
											 
											 var sql2="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id;
											 con.query(sql2,function(er2,re2){

                                               var buyer_id=re2[0].buyer_id;
                                               var seller_id=re2[0].seller_id;
											   
											   var sql="SELECT * FROM users WHERE user_id="+sender_id;
											   con.query(sql,function(er5,re5){
												  
												  
												   var sql3="SELECT *FROM chat_master WHERE user_id='" +buyer_id +"' OR user_id='"+seller_id + "'";
                                                      con.query(sql3,function(er3,re3){
													   
													  // console.log(re4);
													   for(var i=0;i<re3.length;i++)
													   {
														  
														 if(re3[i].status==1)
														 {
															socket.broadcast.to(re3[i].socket_id).emit("new_message",re4);
															if(i==1) // jis user ne request ki hai usko bhi response
															{
																socket.emit("new_message",re4);
															}
														 }
														 else if(re3[i].status==0)// send push notification
														 { 
															 var user_id=re3[i].user_id;
															 push_notification(user_id,re4);
														 }
													 }
												  });	
												  
											   });
	
													
																								  
																		
									 });
											 
											
		                         });
					  
                    });
		   
		  
		  
	  });
	  
	  
	  socket.on("typing",function(packet){
		  var chat_room_id=packet.chat_room_id;
		  var user_id=packet.user_id;
		  
		 var sql="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id;
		 con.query(sql,function(error,result){
			 var buyer_id=result[0].buyer_id;
			 var seller_id=result[0].seller_id;
			 console.log(buyer_id + " " +seller_id);
			 
			 // get name of user who is typing
			 var sql2="SELECT * FROM users WHERE user_id=" +user_id;
			 con.query(sql2,function(er2,re2){
				 
				 var user_name=re2[0].name;
				 
				 var sql3="SELECT *FROM chat_master WHERE user_id='" +buyer_id +"' OR user_id='"+seller_id + "'";
                                                  con.query(sql3,function(er3,re3){
													 //console.log(re3[0].socket_id);
													 for(var i=0;i<re3.length;i++)
													 {
														 console.log(re3[i].socket_id);
														 
														 socket.broadcast.to(re3[i].socket_id).emit("typing",{status:"typing","user_name":user_name});
														 if(i==1) // jis user ne request ki hai usko bhi response
														 {
															 socket.emit("typing",{status:"typing",user_name:user_name});
														 }
														 
														 
													 }
												  })	
			 });
 
		 });
	  });
	  
	  socket.on("stop_typing",function(packet){
		  
		   var chat_room_id=packet.chat_room_id;
		  var user_id=packet.user_id;
		  
		  var sql="SELECT * FROM chat_master WHERE chat_room_id=" +chat_room_id;
		  con.query(sql,function(error,result){
			  //console.log(result.length);
			  for(var i=0;i<result.length;i++)
			  {
				  socket.broadcast.to(result[i].socket_id).emit("typing",{status:"stopped typing"});
			  }
			  
		  })
		  
	  });
	  
	  // chat room users ko jayega except jinse send kiya hai
	  socket.on("delivered",function(packet){
		  
		  var user_id=packet.user_id;
		  var chat_detail_id=packet.chat_detail_id;
		  var chat_room_id=packet.chat_room_id;
		  var time=new Date();
		  var sql="UPDATE chat_details SET delivered_at ='" +time + "',message_status=1 WHERE chat_detail_id=" +chat_detail_id; // 1 for delivered
		  con.query(sql,function(error,result){
			 if(error) throw error;
             socket.emit("delivered",{status:"success"});		 
		  });

	  });
	  
	  socket.on("seen",function(packet){
		  
		   var user_id=packet.user_id;
		  var chat_detail_id=packet.chat_detail_id;
		  var chat_room_id=packet.chat_room_id;
		  var time=new Date();
		  console.log(time);
		  var sql="UPDATE chat_details SET seen_at ='" +time + "',message_status=2 WHERE chat_detail_id=" +chat_detail_id; // 2 for seen
		  con.query(sql,function(error,result){
			 if(error) throw error;
             socket.emit("seen",{status:"success"});			 
		  });
		  
	  })
	  
	   socket.on("get_message_history",function(packet){
		 
          var chat_room_id=packet.chat_room_id;
          var sql4="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_room_id="+chat_room_id;
          con.query(sql4,function(er4,re4){
			 
			 if(er4) throw er4;
			  var chat_details=re4;
			 
			   console.log(chat_details);
			   socket.emit("chat_history",chat_details);
		  });  
	  });
	  
	  socket.on("delete_chat_room",function(packet){
		  var chat_room_id=packet.chat_room_id;
		  var sql5="UPDATE chat_room SET status =0 WHERE chat_room_id ="+chat_room_id;
		  con.query(sql5, function (err, result) { 
            if (err) throw err;
            console.log("record updated");
	       socket.emit("delete_chat_room",{status:"success"});
            });
	  }); 
	  
	  
	  
	  // make user disconnect
	 socket.on("disconnect",function(){
		 var s_id=socket.id;
		 var sql = "UPDATE chat_master SET status=0 WHERE socket_id='" +s_id +"';";
		 con.query(sql,function(error,result){
			 if(error) throw error;
			 console.log("Record updated---status is 0 in chat_master table");
			 socket.emit("disconnect_user",{status:'success'});
		 }); 
		
	 });
	  
	  
});

  
  
  
  
  

    return router;
});