const socket = io('/conductor');
let songPlaying = false;

let song1 = document.getElementById("song1");
song1.onplaying = () => {
    console.log("Song 1 played!");
    songPlaying = true;
    socket.emit("songPlayed", {name: "song1", time: song1.currentTime});
};
song1.onpause = () => {
    console.log("Song 1 paused!");
    songPlaying = false;
    socket.emit("songPaused", {name: "song1", time: song1.currentTime});
};

socket.on("songStateRequest", id => {
    console.log("Received song state request");
    socket.emit("songStateReply", {name: song1.currentSrc, 
        time: song1.currentTime, isPlaying: songPlaying, id: id})
});