const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const router = require('./router');

const app = express();
app.use(cors());
app.use(router);
const server = http.createServer(app);
const io = socketio(server);



let users = [];

const addUser = (userID,socketID) => {
    !users.some((user) => user.userID === userID) &&
        users.push({userID,socketID});
}

const removeUser =(socketID)=>{
    users = users.filter((user) => user.socketID !== socketID);
}

const getUser = (userID) =>{
    return users.find((user)=>user.userID === userID);
}

io.on("connection", (socket)=>{
    //when connect
    console.log("a user connected.");
    //take userID and socketID from user
    socket.on("addUser",userId=>{
        addUser(userId,socket.id);
        io.emit("getUsers",users);
    })

    socket.on("joinConvRoom", data => {
        socket.join(data);
    });

    //send and get message

    socket.on("sendMessage",({senderID, text, room})=>{
        if (room) {
            socket.to(room).emit("getMessage",{
                senderID,
                text,
            });
        };
    });

   socket.on("sendMessNotification",({recipientID,otherUserList})=>{
        users.forEach((user) => {
            if (user) {
                io.to(user.socketID).emit("getMessNotification",otherUserList)
             }
          
        })
    });
    
    //send and get notification
    socket.on("sendNotification",(noty) => {
        const user = getUser(noty.recipient.id);
        console.log(user)
        if (user) {
            io.to(user.socketID).emit("getNotification",noty)
        }
    })

    //when disconnect
    socket.on("disconnect",()=>{
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers",users);

    })


    socket.on('connect_error', function (data) {
        console.log('connection_error');
    });
})

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));
