//---------------------------------------------
// Define variables
//---------------------------------------------
// Tracks if code should be sent to server
let socketEnabled = false;
let socketID;

//---------------------------------------------
// Init websockets
//---------------------------------------------
const socket = io('/performer');
socket.on('connect', () => {
    socketID = socket.id;
    // Logs connectiont to server
    console.log("🌐 Connected to socket server");
    // Allow code to be sent to server
    socketEnabled = true;
    // Send default code to server
    let codeBase = renderOutput();
    // Send code to server if allowed
    console.log("📦 Sending Default Code!", codeBase);
    socket.emit('codeChange', codeBase);
});


// Upon receiving song played event from conductor
socket.on('songPlayed', song => {
    console.log(`Song ${song.name} PLAYED at time ${song.time}`);
    renderOutput(song.name, song.time, true);
});

// Upon receiving song played event from conductor
socket.on('songPaused', song => {
    console.log(`Song ${song.name} PAUSED at time ${song.time}`);
    renderOutput(song.name, song.time, false);
});

socket.on('songState', data => {
    if(socketID == data.id){
        console.log("🎸 Received song state!");
        console.log(`${data.name}, ${data.time}, ${data.isPlaying}`);
        renderOutput(data.name, data.time, data.isPlaying);
    }
});

//---------------------------------------------
// Main logic
//---------------------------------------------
$(document).ready(() => {
    // Get starting codebase and render to output iframe
    renderOutput();

    // Overide default behavior for enter key to shift enter
    $('[contenteditable]').on('keydown', function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            event.preventDefault();
            document.execCommand("insertLineBreak");    
        } else if (event.keyCode == 13 && event.shiftKey) {
          console.log('shift + enter');
        }
    });

    // Text editing and script re-rendering
    $('[contenteditable]').on('focus', () => {
    }).on('blur keyup paste', () => {
        // Save codeblock element
        let codeBlock = document.getElementById("codeBlock")
        // Get current cursor position (Syntax highlighting resets cursor position)
        let cursorPos = getCaretCharacterOffsetWithin(codeBlock);
        // Re-calculate syntax highlighting
        Prism.highlightElement(codeBlock);
        // Reset cursor position to previous value
        setCurrentCursorPosition(codeBlock, cursorPos + 12);
        // Call function to render input to output
        // Returns code or null if error in code
        socket.emit('songStateRequest', socket.id);
        let codeBase = renderOutput();
        // Send code to server if allowed
        if(socketEnabled && codeBase){
            console.log("📦 Sending Code!", codeBase);
            socket.emit('codeChange', codeBase);
        }
    });

// On clicking different examples
$(".example").click(function(){
    if($(this).attr("id") == "example1"){
$("#codeBlock").html(`
// PUT ADDITIONS TO SETUP HERE

}

// GETS VOLUME - MODIFY ONLY MULTIPLIER
function getLevel(){
    if(songPlaying){
        return amp.getLevel()*10;
    } else {
        return mic.getLevel()*100;
    }
}

// DRAW LOOP
function draw() {

    let vol = getLevel();
    
    background(30);
    
    for(var i=0;i<100;i++){
    
        //Draw Outer Ellipses
        fill(30);
        stroke(240);
        ellipseRadius = (ellipseWidth%i)*4*vol;
        ellipse((windowWidth / 2), (windowHeight / 2), ellipseRadius, ellipseRadius);

        //Draw Inner Ellipses
        stroke(255,0,0);
        ellipseRadius = (ellipseWidth%i)*3*vol;
        ellipse((windowWidth / 2), (windowHeight / 2), ellipseRadius, ellipseRadius);
    
    }

    ellipseWidth++;
    
    if(ellipseWidth>920){
    ellipseWidth=1;
    }
    
}`);
    } else if($(this).attr("id") == "example2"){
        $("#codeBlock").html(`
// PUT ADDITIONS TO SETUP HERE

}

// GETS VOLUME - MODIFY ONLY MULTIPLIER
function getLevel(){
    if(songPlaying){
        return amp.getLevel()*10;
    } else {
        return mic.getLevel()*100;
    }
}

// DRAW LOOP
function draw() {

    let vol = getLevel();

    background(30);
}
        `);

    }

    Prism.highlightElement(codeBlock);
});
});

//---------------------------------------------
// Define functions
//---------------------------------------------
// Render current input text to output iframe
function renderOutput(songName, songTime, songPlaying){
    // Save codeblock element
    let codeBlock = document.getElementById("codeBlock")
    // Get code of input without HTML element wrappers
    let codeBase = codeBlock.innerHTML.replace(/(<([^>]+)>)/ig,"")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    // Apply to output iframe
    document.getElementById("output").srcdoc = `
    <style>body{margin: 0; overflow: hidden;}</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/addons/p5.sound.min.js"></script>
    <script>
        let ellipseWidth = 1;
        let ellipseRadius = 1;
        let song;
        let amp, mic;
        let songPlaying = ${songPlaying};
        
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
            } else{
                mic = new p5.AudioIn();
                mic.start();
            }
        ${codeBase}
    </script>`;
    // Try evaluating code to catch errors
    try{ eval(codeBase) }catch(error){ console.log("Code error") }
    // Return output code
    return codeBase;
}

// Get current character position within contenteditable
// From Stackoverflow user Tim Down
// https://stackoverflow.com/questions/4811822/
function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

// Set new cursor position within contenteditable
// From Stackoverflow user Liam
// https://stackoverflow.com/questions/6249095/
function createRange(node, chars, range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);
                if (chars.count === 0) {
                    break;
                }
            }
        }
    } 

    return range;
};

function setCurrentCursorPosition(element, chars) {
    if (chars >= 0) {
        var selection = window.getSelection();

        range = createRange(element.parentNode, { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

// Register tab as keydown
// Adapted from Tim Down at http://stackoverflow.com/a/25943182/460084
// By Kofifus at https://stackoverflow.com/questions/2237497/
function insertTab() {
    if (!window.getSelection) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.collapse(true);
    const span = document.createElement('span');
    span.appendChild(document.createTextNode('\t'));
    span.style.whiteSpace = 'pre';
    range.insertNode(span);
    // Move the caret immediately after the inserted span
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
  
  $(document).on('keydown', '#codeContainer', function(e) {
    if (e.keyCode == 9) {
      insertTab();
      e.preventDefault()
    }
  });