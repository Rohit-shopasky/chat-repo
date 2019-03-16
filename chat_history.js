        

module.exports={

	fetch_from_chat_details:function fetch_from_chat_details(chat_room_id,sql,socket)
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
		
		con.query(sql,function(error,result){
			 
			 if(error) throw error;
			  var chat_details=result;
			 
			  // console.log(chat_details);
			   socket.emit("chat_history",chat_details);
			   module.exports.set_seen_at_time_of_chat_room(chat_room_id,socket,chat_details);
		  }); 
	},
	
	set_seen_at_time_of_chat_room:function set_seen_at_time_of_chat_room(chat_room_id,socket,chat_details)
	{
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
		
		// retrive buyer and seller
		var sql="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id
		con.query(sql,function(error,result){
			var buyer_id  =result[0].buyer_id;
			var seller_id =result[0].seller_id;
			var get_history_user_id=socket.handshake.query.user_id;
			//console.log(buyer_id + " " +seller_id +  " " +socket.handshake.query.user_id);
		
			// search who is the sender
			/*if(buyer_id!=get_history_user_id)
			{
				// emit seen event
				emit_seen_event(buyer_id,con,chat_details,socket);
				// update
			}
			else if(seller_id!=get_history_user_id)
			{
				// emit seen notification
				emit_seen_event(seller_id,con,chat_details,socket);
			} */
			
			var sql="SELECT * FROM chat_details WHERE chat_room_id=" +chat_room_id + " AND seen_at IS NULL";
			con.query(sql,function(error,result){

				if(result.length!=0)
				{
				/*if(result[0].sender_id==seller_id)
				{
					// emit seen event to seller
					update_seen_at(chat_room_id,con,buyer_id,socket);
					//emit_seen_event(seller_id,con,chat_details,socket);
					
					console.log("send buyer");
				}
				else if(result[0].sender_id==buyer_id)
				{
					// emit seen event to buyer
					update_seen_at(chat_room_id,con,seller_id,socket);
					//emit_seen_event(buyer_id,con,chat_details,socket);
					
					console.log("send seller");
				} */
				   
				 if(result[0].sender_id!=socket.handshake.query.user_id)
				 {
					 
					 var user_id=socket.handshake.query.user_id;
					 if(user_id==seller_id)
					 {
						 update_seen_at(chat_room_id,con,buyer_id,socket);
					 }
					 else
					 {
						 update_seen_at(chat_room_id,con,seller_id,socket);
					 }
				 
					 
				 }
			  }				
			});
			
			
		});
		
		
	},
	
}

function emit_seen_event(user_id,con,chat_details,socket)
	{
		var sql="SELECT * FROM chat_master WHERE user_id=" +user_id;
		con.query(sql,function(error,result){
			var socket_id=result[0].socket_id;
			 
			socket.broadcast.to(socket_id).emit("chat_messages_seen",chat_details);
		});
	}
	
function update_seen_at(chat_room_id,con,user_id,socket)
{   var moment = require('moment');
	var time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		var sql="UPDATE chat_details SET seen_at='" +time + "' WHERE seen_at IS NULL AND chat_room_id=" +chat_room_id;
		con.query(sql,function(error,result){
			if(error) throw error;
             var messages_seen=result.affectedRows;
			 
             var sql="SELECT * FROM chat_master WHERE user_id=" +user_id;
		      con.query(sql,function(error,result){
			      var socket_id=result[0].socket_id;
			       
                    var sql="SELECT * FROM chat_details ORDER BY chat_detail_id DESC LIMIT " +messages_seen;
				   con.query(sql,function(error,chat_detail_result){
					   console.log(chat_detail_result);
					      console.log(socket_id);
					   socket.broadcast.to(socket_id).emit("chat_messages_seen",chat_detail_result);
				     })
				   
			     
		          });
			
			 
		});
}