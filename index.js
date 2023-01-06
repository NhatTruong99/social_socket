const io = require('socket.io')(8900,{
    cors:{
        origin:"http://localhost:3000",
    }
});

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

    //send and get message
    socket.on("sendMessage",({senderID,receiverID,text})=>{
        const user = getUser(receiverID);
        if (user) {
            io.to(user.socketID).emit("getMessage",{
                senderID,
                text,
            });
        }
      
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

