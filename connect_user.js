module.exports={

    update_or_insert_chat_master:function(user_id,s_id,time){
		
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
	
	  // console.log(user_id + " "+ s_id + " " +time);		
        
		// check if user_id && chat_room_id are present
		
		var sql="SELECT * FROM chat_master WHERE  user_id=" +user_id;
		con.query(sql,function(error,result){
			if(error) throw error;
			if(result.length==0)
			{   console.log("User not found in chat_master table");
				
				
				var sql="INSERT INTO chat_master SET ?";
				var value={
					"status":1,
					"user_id":user_id,
					"chat_room_id":-1,
					"socket_id":s_id,
					"created_at":time,
					"updated_at":time
				}
				con.query(sql,value,function(error,result){
	                   console.log("inserted new user socket_id");
					   con.end();
				})
				
			}
			else
			{   console.log("not0");
				var sql = "UPDATE chat_master SET socket_id='" +s_id+ "' ,status=1 WHERE user_id="+user_id;
                   con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("chat master record updated to online " +result.affectedRows);
	                con.end();
                  }); 
				
				
				
			}
		});
	
	}


}