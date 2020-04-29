//---------------------------------------------
// Node Server Setup Code
//---------------------------------------------
// Module Requirements// Use python shell
const port = process.env.PORT || 8000;
const express = require("express");
const app = express();
const path = require("path");
const server = require("http")
  .createServer(app)
  .listen(port, () => { 
    console.log("Server listening at port: ", port);
});

app.use(express.static('public'));
 
// Routing - audience at / or /audience
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/audience.html'));
});
app.get('/audience', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/audience.html'));
});

// Routing - performer at /performer
app.get('/performer', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/performer.html'));
});

// Routing - conductor at /conductor
app.get('/conductor', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/conductor.html'));
});
 
//---------------------------------------------
// Variable Declaration
//---------------------------------------------
// Tracks performers
let performersList = [];

//-------------------------------------------------
// Web Sockets
//-------------------------------------------------
const io = require("socket.io").listen(server);

//----------------------------
// Audience
const audience = io.of('/audience');
  // On initial connection
  audience.on('connection', socket => {
    // Log connection at socket id
    console.log(`🎟 Audience member CONNECTED at ${socket.id}`);
    // Request song state
    conductors.emit('songStateRequest', socket.id);
    socket.on('songStateRequest', id => {
      conductors.emit('songStateRequest', socket.id);
    });
    // Log disconnection at socket id
    console.log(`⚠️ Audience member DISCONNECTED at ${socket.id}`);
  });

//----------------------------
// Performers
const performers = io.of('/performer');
  // On initial connection
  performers.on('connection', socket => {
    // Log connection at socket id
    console.log(`🎻 Performer CONNECTED at ${socket.id}`);
    // Send socket info to audience
    audience.emit('performerConnected', socket.id);
    // Request song state
    conductors.emit('songStateRequest', socket.id);
    // Received when a performer changes their code
    socket.on('codeChange', codeBase => {
      console.log(`📦 ${socket.id} has changed their code`)
      audience.emit('codeChange', {id: socket.id, codeBase: codeBase})
    });
    socket.on('songStateRequest', id => {
      conductors.emit('songStateRequest', socket.id);
    });
    // On disconnection
    socket.on("disconnect", () => {
      // Send socket info to audience
      audience.emit('performerDisconnected', socket.id);
      // Log disconnection at socket id
      console.log(`⚠️ Performer DISCONNECTED at ${socket.id}`);
    });
  });

//----------------------------
// Conductor
const conductors = io.of('/conductor');
  // On initial connection
  conductors.on('connection', socket => {
    // Log connection at socket id
    console.log(`👨🏻‍💻 Conductor CONNECTED at ${socket.id}`);
    // On song played
    socket.on("songPlayed", data => {
      performers.emit("songPlayed", data);
      audience.emit("songPlayed", data);
    });
    // Song state reply
    socket.on('songStateReply', data => {
      console.log("Received song state reply for id ", data["id"]);
      audience.emit('songState', data);
      performers.emit('songState', data);
    });
    // On song paused
    socket.on("songPaused", data => {
      performers.emit("songPaused", data);
      audience.emit("songPaused", data);
      
    });
    // On disconnection
    socket.on("disconnect", socket => {
      // Log disconnection at socket id
      console.log(`⚠️ Conductor DISCONNECTED at ${socket.id}`);
    });
  });

//---------------------------------------------
// Function Declaration
//---------------------------------------------