module.exports={


  insert_into_chat_details:function insert_into_chat_details(chat_room_id,sender_id,text,socket,client_message_id,attachment_type,attachment_url){
        console.log(attachment_type + " " +attachment_url);
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
      var send_push_notification  =   require("./send_push_notification");


       	   var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		   var sql="INSERT INTO chat_details SET ?";
		   var values={
			            'chat_room_id':chat_room_id,
						'sender_id'   :sender_id,
						'text'        :text,
						'sent_at'     :time,
					'message_status'  :0,
					'attachment_type' :attachment_type,
					'attachment_url'  :attachment_url,
					'created_at'      :time,
                    'updated_at'      :time					
		   }
		   con.query(sql,values, function (err, result) {
                     if (err) throw err; 
                      //console.log(result.insertId);
	                   var new_chat_detail_id=result.insertId
					  
					  
                                           
					                        var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +new_chat_detail_id;
		                                    con.query(sql,function(error,result){
			                                 
                                             if(error) throw error;
											
											 var chat_room_id=result[0].chat_room_id;
											 
											  // sending result to the client with its client message id
											  result[0].client_message_id=client_message_id;     
											  socket.emit("new_message",result);
											 console.log("New message result " +result);
											 var sql="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id;
											 con.query(sql,function(error,result){
												
											   var buyer_id=result[0].buyer_id;
                                               var seller_id=result[0].seller_id;
												
												var sql="SELECT *FROM chat_master WHERE user_id='" +buyer_id +"' OR user_id='"+seller_id + "'";
												
												con.query(sql,function(error,chat_master_result){
													
													var chat_master_result=chat_master_result;
													
													var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_detail_id=" +new_chat_detail_id;
													
													
													con.query(sql,function(error,result){
														
													  for(var i=0;i<chat_master_result.length;i++)
													   {
														 if(chat_master_result[i].status==1)
														 {  // send socket msg with client message id

															 socket.broadcast.to(chat_master_result[i].socket_id).emit("new_message",result);	
                                                             console.log("new msg" +result);															 
														 }
														
													   }
													   // send push notification to receiver everytime even if he online
													   if(sender_id!=buyer_id)
													   {
														   send_push_notification.push(buyer_id,new_chat_detail_id,chat_room_id);
														   console.log("Sending push notification to buyer_id " +buyer_id);
													   }
													   else if(sender_id!=seller_id)
													   {
														    send_push_notification.push(seller_id,new_chat_detail_id,chat_room_id);
															console.log("Sending push notification to seller_id " +seller_id);
													   }
													      /*  if(chat_master_result.length==2)
															{	
                                                         // when botth the users are online then msg will be seen
														    
															  if(chat_master_result[0].status==1 && chat_master_result[1].status==1)
													          {
														         // set status of the message be seen call function 
																
                                                              module.exports.update_sent_at_if_user_online(result,sender_id,socket);
															  console.log("seen_at updated");
													          }
															} */
													   		con.end();											   
													});
													
													
													
													
												});
												
											 });

		                         });
					    
                    });

	  
  
  },
  
  update_sent_at_if_user_online:function update_sent_at_if_user_online(result,user_id,socket)
  {    
	  var chat_detail_id=result[0].chat_detail_id;
	  var chat_room_id  =result[0].chat_room_id;
	  var sender_id     =result[0].sender_id;
	  const mysql = require('mysql');
        var moment = require('moment');
        var con=require("./db.js");
        var con = mysql.createConnection({
        host     :'reeldealdb.cl65udzq02ea.us-east-1.rds.amazonaws.com',
        user     : 'rd_live',
        password : 'reeldeal1',
        database : 'reeldeal',
        port     : process.env.RDS_PORT
        });
		var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		var sql="UPDATE chat_details SET seen_at='" +time + "' WHERE chat_detail_id=" +chat_detail_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			 var messages_seen=result.affectedRows;
			 
             var sql="SELECT * FROM chat_master WHERE user_id=" +sender_id;
		      con.query(sql,function(error,result){
			      var socket_id=result[0].socket_id;
			       
				   var sql="SELECT users.name, users.image_url,chat_details.text ,chat_details.chat_detail_id, chat_details.chat_room_id, chat_details.sender_id, chat_details.receiver_id, chat_details.text, chat_details.sent_at, chat_details.delivered_at, chat_details.seen_at, chat_details.attachment_type, chat_details.attachment_url, chat_details.message_status, chat_details.created_at, chat_details.updated_at FROM chat_details JOIN users WHERE users.user_id=chat_details.sender_id AND chat_details.chat_room_id="+chat_room_id + " ORDER BY chat_detail_id DESC LIMIT " +messages_seen;
				   con.query(sql,function(error,chat_detail_result){
					   console.log(chat_detail_result);
					   console.log(socket_id);
					   socket.emit("chat_messages_seen",chat_detail_result);
					   con.end();
				     })
				   
			     
		          });
			
			 
		});
  }


}