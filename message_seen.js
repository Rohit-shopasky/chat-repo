module.exports = {
	
	
	
update_seen_at:function update_seen_at(chat_detail_id,time,socket){
		//console.log(chat_detail_id + " " +time);
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
  
      var sql="SELECT * FROM chat_details WHERE chat_detail_id=" +chat_detail_id;
	  con.query(sql,function(error,result){
		   if(error) throw error;
		   console.log(result);
		  var chat_room_id = result[0].chat_room_id;
		  var sender_id    = result[0].sender_id;

		  var sql="SELECT * FROM chat_room WHERE chat_room_id=" +chat_room_id;
		  con.query(sql,function(error,result){
			    var buyer_id   = result[0].buyer_id;
				var seller_id  = result[0].seller_id;
			    mark_seen_at(con,socket,buyer_id,seller_id,chat_room_id,time)
		  });
		  
	  });
		
  }
};


function mark_seen_at(con,socket,buyer_id,seller_id,chat_room_id,time)
{
	console.log(chat_room_id + " " +time);
	  var sql="UPDATE chat_details SET seen_at='" +time + "' WHERE  chat_room_id=" +chat_room_id;
	  con.query(sql,function(error,result){
		  if(error) throw error;
		  var messages_seen=result.changedRows;
		  console.log("Messages_seen ->" +messages_seen);
		   var sql="SELECT * FROM chat_details ORDER BY chat_detail_id DESC LIMIT " +messages_seen;
		   con.query(sql,function(error,result){
			   
			   var chat_detail_result=result;
			   var sql="SELECT * FROM chat_master WHERE user_id=" +buyer_id + " OR user_id=" + seller_id + "";
               con.query(sql,function(error,result){
				   
				       socket.emit("mark_seen",chat_detail_result);  // forcefully send msg...to sender
		              for(var i=0;i<result.length;i++)
					  {
						  console.log(chat_detail_result);
						  var socket_id=result[i].socket_id;
						  socket.broadcast.to(socket_id).emit("mark_seen",chat_detail_result);  // message to receiver 
					  }
	           });
		   });
		  
		  
		  
	  }); 
	
	
	
}








