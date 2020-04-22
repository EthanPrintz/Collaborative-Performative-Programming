//---------------------------------------------
// Define variables
//---------------------------------------------
// Tracks performers
let performers = [];

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
    // Log code change
    console.log(`📦 ${id} has changed their code`)
    // Check if ID exists in array
    // If it does not exist
    if(!performers.some(performer => performer.id == id)){
        performers.push({id: id, codeBase: ''})
        // Log table of current performers
        console.table(performers);
        // Add iframe for performer
        $("#performers").append(`
        <iframe class="output" id="${id.split("#")[1]}" 
        sandbox="allow-same-origin allow-scripts"
        srcdoc="<style>body{margin: 0; overflow: hidden;}</style>
        <script src='https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js'></script>
        <script>${codeBase}</script>">
        </iframe>`);
    // If it does exist
    } else {
        // Change iFrame srcdoc property
        document.getElementById(id.split("#")[1]).srcdoc = `
        <style>body{margin: 0; overflow: hidden;}</style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
        <script>${codeBase}</script>`;
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
    console.table(performers)
});