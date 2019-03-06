// var express = require('express')
//   , http = require('http');
// //make sure you keep this order
// var app = express();
// var server = http.createServer(app);
// var io = require('socket.io').listen(server);
// var path        =require('path');

function liveStream(io){
var users={};

// app.use(express.static(path.join(__dirname)));
io.on('connection',function(socket){
    console.log('a user has connected');
    socket.on('clientMessage',function(clientMessage){
        var data
      //  try{
            data=JSON.parse(clientMessage);
       // }
        // catch{
        //     console.log('INVALID JSON');
        //     data={};
        // }

        switch(data.type){
            case "login":
                console.log("User logged in:",data.name)
                if(users[data.name])
                {
                    sendTo(socket,{
                        type:"login",
                        success:false
                    });
                } 
                else{
                    users[data.name]=socket;
                    socket.username=data.name;
                    sendTo(socket,{
                        type:"login",
                        success:true
                    });
                }     
                 break;
            
            case "offer":
                if(users[data.name])
                {   console.log("someones trying an offer");
                    socket.userb=data.name;
                    sendTo(users[data.name],{
                        type:"offer",
                        offer:data.offer,
                        name:socket.username,
                        socketid:socket.id
                    });
                    console.log(socket.id);
                }
                break;
            case "answer":
                if(users[data.name])
                {
                    socket.userb=data.name;
                    sendTo(users[data.name],{
                        type:"answer",
                        answer:data.answer,
                        //a litte extra info
                        name:socket.username
                    });
                }
                break;
            case "candidate":
                console.log("ICE candidates being sent to:",data.name);
                if(users[data.name])
                sendTo(users[data.name],{
                    type:"candidate",
                    candidate:data.candidate,
                    socketid:socket.id
                });
                break;
            case "disconnect":
                console.log("User disconnected:",data.name)
                if(users[data.name])
                {
                    sendTo(users[data.name],{
                        type:"disconnect"
                        //check socket.username usecase
                    });
                }
                break;
            
            default:
                sendTo(socket,{
                    type:"error",
                    message:"invalid command"
                });
                break;
            }
        

        });
       
    //});

  


    socket.on('disconnect',function(){
        if(socket.username)
        {
        delete users[socket.username];
        if(socket.userb)
        {   // changes required while handling live stream for multi users
            var soc=users[socket.userb];
           
            if(soc!=null)
            {
                soc.userb=null;
                sendTo(soc,{type:"leave"});
            }
        }
    }
        console.log('a user has disconnected');
    });
    function sendTo(socket,serverMessage)
    {
        socket.emit('serverMessage',JSON.stringify(serverMessage));
    }
});
}

module.exports.liveStream = liveStream;

// server.listen(process.env.PORT||3000,function(){console.log("App has started")});