//---------------------------------------------
// Define variables
//---------------------------------------------
// Tracks performers
let performers = [];
let songPlaying = false;
let songTime = 0;

//---------------------------------------------
// Init websockets
//---------------------------------------------
const socket = io('/audience');
// Upon connecting to the server
socket.on('connect', () => {
    // Logs connectiont to server
    console.log('🌐 Connected to socket server');
});

// Upon receiving new performer
socket.on('performerConnected', id => {
    performers.push({id: id, codeBase: ''})
    // Log table of current performers
    console.table(performers);
    // Add iframe for performer
    $("#performers").append(`
    <iframe class="output" id="${id.split("#")[1]}" 
    sandbox="allow-same-origin allow-scripts">
    </iframe>`);
});

socket.on('codeChange', ({id, codeBase}) => {
    socket.emit('songStateRequest', socket.id);
    // Log code change
    console.log(`📦 ${id} has changed their code`)
    // Check if ID exists in array
    // If it does not exist
    if(!performers.some(performer => performer.id == id)){
        performers.push({id: id, codeBase: codeBase})
        // Log table of current performers
        console.table(performers);
        // Add iframe for performer
        $("#performers").append(`
        <iframe class="output" id="${id.split("#")[1]}" 
        sandbox="allow-same-origin allow-scripts"
        srcdoc="${returnOutput("1", false, 0, codeBase)}">
        </iframe>`);
    // If it does exist
    } else {
        performers[performers.findIndex(performer => performer.id == id)]['codeBase'] = codeBase;
        // Log table of current performers
        console.table(performers);
        // Change iFrame srcdoc property
        document.getElementById(id.split("#")[1]).srcdoc = returnOutput("1", false, 0, codeBase);
    }
});

// Upon removing existing performer
socket.on('performerDisconnected', id => {
    // Log id of leaving performer
    console.log(`Removing id of ${id}`)
    // Remove performer from array
    performers = $.grep(performers, function(performer){ 
        return performer.id != id; 
    });
    // Remove iframe from DOM
    $(`#${id.split("#")[1]}`).remove();
    // Log table of remaining performers
    console.table(performers);
});

// Upon receiving song played event from conductor
socket.on('songPlayed', song => {
    console.log(`Song ${song.name} PLAYED at time ${song.time}`);
    performers.forEach(performer => {
        document.getElementById(performer['id'].split("#")[1]).srcdoc = returnOutput(song.name, true, song.time, performer.codeBase);
    });
});

// Upon receiving song played event from conductor
socket.on('songPaused', song => {
    console.log(`Song ${song.name} PAUSED at time ${song.time}`);
    performers.forEach(performer => {
        document.getElementById(performer['id'].split("#")[1]).srcdoc = returnOutput(song.name, false, song.time, performer.codeBase);
    });
});

socket.on('songState', data => {
    if(socket.id == data.id){
        console.log("🎸 Received song state!");
        console.log(`${data.name}, ${data.time}, ${data.isPlaying}`);
        performers.forEach(performer => {
            document.getElementById(performer['id'].split("#")[1]).srcdoc = returnOutput(data.name, 
                data.isPlaying, data.time, performer.codeBase);
        });
        console.log("SRC UPDATED!", )
    }
});

function returnOutput(songName, songPlaying, songTime, codeBase){
    return `<style>body{margin: 0; overflow: hidden;}</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/addons/p5.sound.min.js"></script>
    <script>
        let ellipseWidth = 1;
        let ellipseRadius = 1;
        let song;
        let amp;
        
        function preload(){
            song = loadSound('../music/musicForProgramming-1.mp3')
        }
        
        function setup() {
            // Create P5 Canvas
            createCanvas(windowWidth, windowHeight);
        
            // Create amp for music visualization
            amp = new p5.Amplitude();
            
            if(${songPlaying}){
                song.play();
                song.jump(${songTime});
            }
        //============================================
        // Do not change anything above this line
        //============================================
        ${codeBase}
    </script>`
}