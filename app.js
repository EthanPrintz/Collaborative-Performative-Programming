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


//---------------------------------------------
// Function Declaration
//---------------------------------------------