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

socket.on("songStateRequest", data => {
    console.log("Received song state request at time", (data.requestTime ?? "unspecified"));
    socket.emit("songStateReply", {
        name: song1.currentSrc, 
        time: song1.currentTime, 
        isPlaying: songPlaying, 
        performerId: data.performerId,
        audienceId: (data.audienceId ?? ''),
        requestTime: (data.requestTime ?? 0)
    });
});
