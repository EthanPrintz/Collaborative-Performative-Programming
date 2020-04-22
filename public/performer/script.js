//---------------------------------------------
// Define variables
//---------------------------------------------
// Tracks if code should be sent to server
let socketEnabled = false;

//---------------------------------------------
// Init websockets
//---------------------------------------------
const socket = io('/performer');
socket.on('connect', () => {
    // Logs connectiont to server
    console.log("🌐 Connected to socket server");
    // Allow code to be sent to server
    socketEnabled = true;
    // Send default code to server
    let codeBase = renderOutput();
    // Send code to server if allowed
    console.log("📦 Sending Default Code!");
    socket.emit('codeChange', codeBase);
});

//---------------------------------------------
// Main logic
//---------------------------------------------
$(document).ready(() => {
    // Get starting codebase and render to output iframe
    renderOutput();

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
        let codeBase = renderOutput();
        // Send code to server if allowed
        if(socketEnabled && codeBase){
            console.log("📦 Sending Code!");
            socket.emit('codeChange', codeBase);
        }
    });
});

//---------------------------------------------
// Define functions
//---------------------------------------------
// Render current input text to output iframe
function renderOutput(){
    // Save codeblock element
    let codeBlock = document.getElementById("codeBlock")
    // Get code of input without HTML element wrappers
    let codeBase = codeBlock.innerHTML.replace(/(<([^>]+)>)/ig,"")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    // Apply to output iframe
    document.getElementById("output").srcdoc = `
    <style>body{margin: 0; overflow: hidden;}</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
    <script>${codeBase}<\/script>`;
    // Try evaluating code to catch errors
    try{ eval(codeBase) }catch(error){ return null }
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