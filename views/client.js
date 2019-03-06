var username;
var connectedUser;
var socket=io();
var connections={};
var Streamer;
socket.on('serverMessage',function(message){
    var data=JSON.parse(message);
    switch (data.type){
        case "login":
            if(Streamer==true)
            {
                handleloginstreamer(data.success)
            }
            else handlelogin(data.success);
            break;
        case "offer":
            handleoffer(data.offer,data.name,data.socketid);
            break;
        case "answer":
            handleanswer(data.answer)
            break;
        case "candidate":
            if(Streamer==true)
            {
            handlecandidatestreamer(data.candidate,data.socketid);
            }
            else handlecandidate(data.candidate);

            break;
        case "disconnect":
            handledisconnect();
            break;
        default:
            break;
    }
});
function send(message) { 
    //attach the other peer username to our messages 
    if (connectedUser) { 
        
       message.name = connectedUser; 
    } 
    console.log("sending an ",message.type,"to",connectedUser);
    socket.emit('clientMessage',JSON.stringify(message)); 
 };

 var loginPage = document.querySelector('#loginPage'); 
 var usernameInput = document.querySelector('#usernameInput'); 
 var loginBtn = document.querySelector('#loginBtn'); 
 var streamBtn=document.querySelector('#streamerLogin');
 var callPage = document.querySelector('#callPage'); 
 var callToUsernameInput = document.querySelector('#callToUsernameInput');
 var callBtn = document.querySelector('#callBtn'); 
 
 var hangUpBtn = document.querySelector('#hangUpBtn');
 var localVideo = document.querySelector('#localVideo'); 
var remoteVideo = document.querySelector('#remoteVideo');
 
var yourConn; 
var stream;
 callPage.style.display = "none"; 
 console.log(usernameInput.value);
 loginBtn.addEventListener("click",function(event){
    console.log("wtf???");

    username=usernameInput.value;
    if(username.length>0)
    {
        Streamer=false;
        send({type:"login",name:username});
    }
 });

 streamBtn.addEventListener("click",function(event){
     console.log("waw it actually reatched here");
    username=usernameInput.value;
    if(username.length>0)
    {
        Streamer=true;
        send({type:"login",name:username});
    }
 });

 function handlelogin(success)
 {
     if(!success)
     alert("username already taken");
     else{
        var configuration = { 
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" },
            {
              'urls': 'turn:192.158.29.39:3478?transport=udp',
              'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              'username': '28224511:1379330808'
            },
            {
              'urls': 'turn:192.158.29.39:3478?transport=tcp',
              'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              'username': '28224511:1379330808'
            }] 
         }; 
         console.log("successfully logged in");
         loginPage.style.display="none";
         callPage.style.display="block";
         localVideo.style.display="none";
         yourConn = new webkitRTCPeerConnection(configuration);
         yourConn.ontrack=function(e){
            console.log("general kenobi")
            remoteVideo.srcObject=e.streams[0];
        }
         yourConn.onicecandidate=function(event){
            if (event.candidate) { 
                console.log("pls send candidates");
                send({ 
                   type: "candidate", 
                   candidate: event.candidate 
                }); 
             } 
         }
        //  navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) {
        //      stream=myStream;
        //      localVideo.srcObject=stream;
        //      var configuration = { 
        //         "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
        //      }; 
        //      yourConn = new webkitRTCPeerConnection(configuration);
        //      yourConn.addStream(stream); 
        //     //  yourConn.onaddstream=function(e){
        //     //      console.log("general kenobi")
        //     //      remoteVideo.srcObject=e;
        //     //  }
        //      yourConn.ontrack=function(e){
        //         console.log("general kenobi")
        //         remoteVideo.srcObject=e.streams[0];
        //     }
        //      yourConn.onicecandidate=function(event){
        //         if (event.candidate) { 
        //             send({ 
        //                type: "candidate", 
        //                candidate: event.candidate 
        //             }); 
        //          } 
        //      }


        //  },function (error) { 
        //     console.log(error); 
        //  }
        //  );
        }
 }
 callBtn.addEventListener("click",function(){
     var callToUsername=callToUsernameInput.value;
     if(callToUsername.length>0)
     {
         connectedUser=callToUsername;
         yourConn.createOffer(function(offer){
             send({type:"offer",offer:offer});
            yourConn.setLocalDescription(offer,function(){
                console.log("set local description is accessed");
            });
            }
         ,function(error)
            {
            alert("error connecting to user");
        },{offerToReceiveAudio:true,offerToReceiveVideo:true});
     }
});
function handleoffer(offer,name,socketid){
    connectedUser=name;
   // console.log(connectedUser)
    var configuration = { 
        "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
     }; 
     
     connections[socketid]=new webkitRTCPeerConnection(configuration); 
     yourConn=connections[socketid];
     yourConn.addStream(stream); 
     yourConn.onicecandidate=function(event){
        if (event.candidate) { 
            console.log("pls send streamer candidates");

            send({ 
               type: "candidate", 
               candidate: event.candidate 
            }); 
         } 
     }

    console.log("an offer has come");
    //no clue what the setremotedescription is :(
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));
    yourConn.createAnswer(function(answer)
    {   
        yourConn.setLocalDescription(answer); 
        send({type:"answer",answer:answer});

    },function(error){
        alert("error establishing an incoming connection");
        console.log(error);
    });
}
function handleanswer(answer)
{   console.log("an answer has come!!!");
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
}
function handlecandidate(candidate)
{
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
}
hangUpBtn.addEventListener("click",function(){
    send({type:"disconnect"});
    handledisconnect();
    });
function handledisconnect()
{
    connectedUser = null; 
    remoteVideo.src = null; 
     
    
    yourConn.onicecandidate = null; 
    yourConn.onaddstream = null; 
    yourConn.close(); 
    handlelogin(true);
};

function handlecandidatestreamer(candidate,socketid)
{
    yourConn=connections[socketid];
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
}

function handleloginstreamer(success)
{
    
    if(!success)
    alert("username already taken");
    else{
        console.log("successfully logged in");
        loginPage.style.display="none";
        callPage.style.display="block";
        
        navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) {
            stream=myStream;
            console.log("should be streaming now");
            remoteVideo.srcObject=stream;
        },function (error) { 
                 console.log(error); 
             });
    }
}


 