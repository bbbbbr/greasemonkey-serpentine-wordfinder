// ==UserScript==
// @name        Serpentine Word Finder
// @namespace   http://www.serpentinegame.com/*
// @description Finds words on the Serpentine Game board
// @include     http://*.serpentinegame.com/*
// @include     http://serpentinegame.com/*
// @include     https://*.serpentinegame.com/*
// @include     https://serpentinegame.com/*
// @grant       GM_getResourceText
// @version     0.4.0
// @license     GPL
// @resource    resWordTreeJson resource/wordtreejsonEnable172k.js
// ==/UserScript==


/* TODO

* Cleanup
  * Split script into multiple files
  * Organization
  * Comments
  * Global vars

* Convert heatmap buttons
* Auto adjust send delay based on number of words found and total time available

* OPTIONAL : monitor chat area for commands (enable/disable/set-speed)
*/


// ============================= END HEAT MAP SECTION =============================

// Heat Map : Reset array and counters for collecting tile usage data
function heatMapReset()
{
    var x,y;
    // Initializes/clears 2D array for storing board tiles
    // TODO : pass in params instead of globalizing them
    for(x = 0; x < boardArraySize; x++) {
        boardTileStatWordUsedCount[x]  = [];
        boardTileStatStartWordCount[x] = [];
        boardTileStatEndWordCount[x]   = [];
    }

    // Zero out the array
    for (x = 0; x < boardTiles.length; x++) {
        for (y = 0; y < boardTiles[x].length; y++) {
            boardTileStatWordUsedCount[x][y]  = 0;
            boardTileStatStartWordCount[x][y] = 0;
            boardTileStatEndWordCount[x][y]   = 0;
        }
    }

    boardTileStatWordUsedCountMaxVal  = 0;
    boardTileStatStartWordCountMaxVal = 0;
    boardTileStatEndWordCountMaxVal   = 0;
}


// Heat Map : update the heat map with set of tiles used for a word
function heatMapIncrementUsedTiles(wordLength)
{
    var x,y;
    var tempColor, redVal, greenVal, blueVal;

    for (x = 0; x < boardTiles.length; x++)
    {
        for (y = 0; y < boardTiles[x].length; y++)
        {
            // Update the basic tile usage count
            if (boardTileUsed[x][y] > 0)
            {
                boardTileStatWordUsedCount[x][y]++;

                if (boardTileStatWordUsedCount[x][y] > boardTileStatWordUsedCountMaxVal)
                    boardTileStatWordUsedCountMaxVal = boardTileStatWordUsedCount[x][y];
            }

            // Update the start-of-word tile count
            if (boardTileUsed[x][y] == 1)
            {
                boardTileStatStartWordCount[x][y]++;

                if (boardTileStatStartWordCount[x][y] > boardTileStatStartWordCountMaxVal)
                    boardTileStatStartWordCountMaxVal = boardTileStatStartWordCount[x][y];
            }

            // Update the start-of-word tile count
            if (boardTileUsed[x][y] == wordLength)
            {
                boardTileStatEndWordCount[x][y]++;

               if (boardTileStatEndWordCount[x][y] > boardTileStatEndWordCountMaxVal)
                    boardTileStatEndWordCountMaxVal = boardTileStatEndWordCount[x][y];
            }
        } // END : for (y ...
    } // END : for (x ...
}


function heatMapDrawUsedTiles()
{
    heatMapDrawToBoard(boardTileStatWordUsedCount, boardTileStatWordUsedCountMaxVal);
}


function heatMapDrawStartTiles()
{
    heatMapDrawToBoard(boardTileStatStartWordCount, boardTileStatStartWordCountMaxVal);
}


function heatMapDrawEndTiles()
{
    heatMapDrawToBoard(boardTileStatEndWordCount, boardTileStatEndWordCountMaxVal);
}


// Heat Map : Update the tiles on the board to represent the tile usage heat map
function heatMapDrawToBoard(tileStatArray, maxVal)
{
    var x,y;
    var tempColor, redVal, greenVal, blueVal;

    // Now update the board tile background color based on tile usage in the supplied array
    for (x = 0; x < tileStatArray.length; x++)
    {
        for (y = 0; y < tileStatArray[x].length; y++)
        {
            if (tileStatArray[x][y] > 0)
            {
                redVal   = 0;
                greenVal = 0   + Math.floor( tileStatArray[x][y] / (maxVal / 256) );
                blueVal  = 255 - Math.floor( tileStatArray[x][y] / (maxVal / 256) );

                tempColor = "rgb(" + redVal.toString() + ", " + greenVal.toString() + ", " + blueVal.toString() + ")";
            }
            else
            {
                tempColor = "rgb(0,0,0)";
            }

            // Update the tile color - must use setProperty instead of .style.backgroundColor in order to use CSS !imporant color override
            document.querySelector("#board_" + x.toString() + "_" + y.toString()).style.setProperty("background-color", tempColor, "important");
        }
    }
}


// ============================= END HEAT MAP SECTION =============================


function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}


function pushWordToGame(strWord)
{
    // TODO : check querySelector values for NULL and signal failure if needed, then bubble up and don't delete word if failed
    document.querySelector("#word").value = strWord;
    eventFire( document.querySelector("#word_send") ,'click');
}


function sendItemFromFoundWords()
{
    // TODO : of potential interest : Object.keys(hash_table).length

    for (var wordEntry in foundWords)
    {
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (foundWords.hasOwnProperty( wordEntry ))
        {
            if (foundWords[wordEntry] == true)
            {
                // Send the word to the game
                pushWordToGame(wordEntry);

    // alert("deleting word : " + wordEntry);

                // Remove the item from the list
                // delete foundWords[wordentry];  // This crashes
                // delete foundWords.wordEntry;   // This doesn't appear to remove it from the list as far as the test methods above are concerned
                // TODO : fix deletion here that wasn't working
                // Workaround :
                foundWords[wordEntry] = false; // Flag as "sent"


                // Indicate success, a word was found and sent
                return(true);
            }
        }
    }

    // If we made it this far then a word was not sent and the list is empty
    // Signal failure which so that no more attempts are made to send words
    return(false);
}

function sendWordListOnTimer(msWaitTime)
{
//    alert("sending word then delay : "  + msWaitTime.toString());

    if ((continueSendingWords) && (!isIntermission) && (isEnabled))
    {
        if (sendItemFromFoundWords())
        {
            // Sending returned success so there may be more to send.
            // Queue up another transmit after N milliseconds

            // Add some variability to the delay, between 0.5 to 1.5 times : return Math.random() * (max - min) + min;
            var semiRandomizedDelay = msWaitTime *  ((Math.random() * 1) + 0.5);
            setTimeout(function() { sendWordListOnTimer(msWaitTime); }, semiRandomizedDelay);
        }
        else
        {
            // No more words to send
            stopSendingWords();
        }
    }
    else
    {
        stopSendingWords();
    }
}


//Trickle-send the words to the game with a timer delay between each send
function startSendingWords()
{
    setStatusItemState('statusSendWords','success');
    continueSendingWords = true;
    sendWordListOnTimer(msWaitBetweenWordSendsToGame);
}

function stopSendingWords()
{
    continueSendingWords = false;
    setStatusItemState('statusSendWords','init');
}


function resetFoundWordList()
{
    foundWords     = {};
    foundWordCount = 0;
}


function checkAdjacentTiles(cx, cy, wordTreeNode, tileLetter, strWorkString, wordLen)
{
    var x,y;

   // Now check all adjacent tiles, including diagonals
    for (x = cx - 1; x <= cx + 1; x++) {
        for (y = cy - 1; y <= cy + 1; y++) {
            // Make sure to stay within board boundaries
            if ((x >= 0) && (x < boardTiles.length) && (y >= 0) && (y < boardTiles[x].length)) {
                // Don't use tiles which are currently occupied
                if (boardTileUsed[x][y] == 0) {
                    // Feed in :
                    // * offset from current working tile (x,y)
                    // * child node by-letter of of the current radix/trie word tree
                    // * current word length
                    // * current working string
                    if (wordTreeNode[ tileLetter ])  // TODO : is checking for the child here redundant?
                        checkBoardTile(x, y, wordTreeNode[ tileLetter ], wordLen, strWorkString);
                }
            }
        }
    }
}


function checkLetterInWordTree(cx, cy, wordTreeNode, tileLetter, strWorkString, wordLen)
{
    // Is the current letter present at the current location in the word tree?
    if ( wordTreeNode.hasOwnProperty( tileLetter ) ) {

        // Append current tile letter to the working string
        strWorkString = strWorkString + tileLetter;

        // Check to see if the current string of letters forms a valid word
        if ( wordTreeNode[ tileLetter ]['iw'] ) {

            if (wordLen >= wordMinLength) {
                if (foundWords.hasOwnProperty(strWorkString) == false) {

                    // TODO : move this into a function
                    // Add the word to the list
                    foundWords[strWorkString] = true;
                    foundWordCount++;

                    // Frivolous heat mapping
                    heatMapIncrementUsedTiles(wordLen);
                }
            }
        }

        // Now check all adjacent tiles, including diagonals
        checkAdjacentTiles(cx, cy, wordTreeNode, tileLetter, strWorkString, wordLen);
    }

}


//
// Checks a board tile at a given location for words - uses recursion
//
function checkBoardTile(cx, cy, wordTreeNode, wordLen, strWorkString)
{
    var tileLetter

    wordLen++;
    if (wordLen > maxWordLen) return;

    // Flag current tile as occupied
    boardTileUsed[cx][cy] = wordLen;

    // Read letter for current tile
    tileLetter = boardTiles[cx][cy];

    // Special handling for 'qu' tiles (the only tile with two letters)
    if (tileLetter == 'qu')
    {
        // If 'q' is a valid entry in word tree at this location then step past it and test with 'u'
        if ( wordTreeNode.hasOwnProperty( 'q' ) )
        {
            // Advance past 'q' to the letter 'u' in the word tree, append it to the working string, and check for words using 'u'
            checkLetterInWordTree(cx, cy, wordTreeNode[ 'q' ], 'u', strWorkString + 'q', wordLen + 1);
        }

        // Now drop through and handle 'q' as a singular letter without the trailing 'u'
        tileLetter = 'q';
    }

    // Test letter and explore further tiles and words if possible
    checkLetterInWordTree(cx, cy, wordTreeNode, tileLetter, strWorkString, wordLen);


    // Release tile for use
    boardTileUsed[cx][cy] = 0;
}


//
// Scans each tile on the board for words
// * extractBoardToArray() must be called first
//
function findWordsOnBoard()
{
    var x,y;
    resetFoundWordList();
    heatMapReset();

    // Make sure a dictionary is loaded
    if (wordTree != null) {
        for (x = 0; x < boardTiles.length; x++) {
            for (y = 0; y < boardTiles[x].length; y++) {

                // Feed in :
                // * current tile (x,y)
                // * root node of the radix/trie word tree
                // * word length 0
                // * blank working string
                checkBoardTile(x, y, wordTree, 0, "");
            }
        }
    }

    // DEBUG : dump list of words
    for (var wordEntry in foundWords) {
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (foundWords.hasOwnProperty( wordEntry )) {
            console.debug(wordEntry);
        }
    }
    console.debug("Found Words : " + foundWordCount.toString() );

    if (foundWordCount > 0)
    {
        setStatusItemState('statusWords','success');
        return (true);
    }
    else
    {
        setStatusItemState('statusWords','error');
        return (false);
    }

}




//
// Installs a mutation observer callback for nodes matching the given css selector
//
function registerMutationObserver(selectorCriteria, monitorSubtree, callbackFunction)
{
    // Cross browser mutation observer support
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    // Find the requested DOM nodes
    var targetNodeList = document.querySelectorAll(selectorCriteria);


    // Make sure the required elements were found, otherwise don't install the observer
    if ((targetNodeList != null) && (MutationObserver != null)) {

        // Create an observer and callback
        var observer = new MutationObserver( callbackFunction );

        // Start observing the target element(s)
        for(var i = 0; i < targetNodeList.length; ++i) {

            observer.observe(targetNodeList[i], {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: monitorSubtree,
                characterDataOldValue: true
            });
        }
    }
}


//
// Locate the element which displays the board settings and extract them from it
//
function extractBoardSettings()
{
    // Extract board settings from the following location in the DOM
    //
    // <div id=words>
    //     <div>
    //         Board Size: 5
    //         Minimum Letters: 4

    // The #words div element is the parent to the div which has the settings (which lacks an id)
    var wordsEl = document.getElementById('words');

    if (wordsEl) {
        // [0] = full match text, [1] Minimum number of letters
        // OPTIONAL : var boardSettingsMatch = /.*Board Size: (\d+).*Minimum Letters: (\d+).*/mi.exec( wordsEl.innerHTML );
        // Don't extract the board size right now since it's determined automatically when extracting the board tiles
        var boardSettingsMatch = /.*Minimum Letters: (\d+).*/mi.exec( wordsEl.innerHTML );

        if (boardSettingsMatch != null) {
            wordMinLength = parseInt(boardSettingsMatch[1]);
            console.debug('Found Min Word Size : ' + wordMinLength.toString());
            return (true); // TODO : utilize return code
        }
    }

    return (false); // signal failure
}

// Initializes/clears 2D array for storing board tiles
// TODO : pass in params instead of globalizing them
function initBoardArray()
{
    for(var x = 0; x < boardArraySize; x++){
        boardTiles[x] = [];
        boardTileUsed[x] = [];
    }

    boardWidth  = -1;
    boardHeight = -1;
}


//
//  Build an array out of board tiles if present
//
function extractBoardToArray()
{
    // Clear board array
    initBoardArray();

    // Board tiles have these properties : div class="board_pusher" id="pusher_x_y" (0..N-1)
    var tileNodes = document.querySelectorAll('[id*=pusher_]');
    if (tileNodes != null)
    {

        for(var i = 0; i < tileNodes.length; ++i)
        {
            // [0] = full match text, [1] = zero based X position of tile , [2] = zero based Y position of tile
            var tilePosMatch = /pusher_(\d)_(\d)/i.exec( tileNodes[i].id );

            if (tilePosMatch != null)
            {
                var xPos = parseInt(tilePosMatch[1]);
                var yPos = parseInt(tilePosMatch[2]);

                if ((xPos < boardArraySize) && (yPos < boardArraySize))
                {
                    boardTiles[xPos][yPos]    = tileNodes[i].innerText.toLowerCase(); // Dictionary is in lower case
                    boardTileUsed[xPos][yPos] = 0;

                    if (xPos > boardWidth)  { boardWidth  = xPos; }
                    if (yPos > boardHeight) { boardHeight = yPos; }
                }
            }
        }

        boardNeedsUpdate = false;

        // DEBUG - dump to console
        var strBoardText = "";
        for (x = 0; x < boardTiles.length;x++) {
            for (y = 0; y < boardTiles[x].length; y++) {
                strBoardText = strBoardText + boardTiles[x][y] + ' ';
            }
            strBoardText = strBoardText + '\n';
        }

console.debug('BOARD\n=============\n' + strBoardText);
       setStatusItemState('statusBoard','success');
       return (true);
    }
    else
    {
console.debug('no board');
        setStatusItemState('statusBoard','error');
        return (false);
    }
}


/*
function checkTime() {
    var tileNodes = document.querySelectorAll('[id=timeleft]');
    if (tileNodes != null) {

    }
}
*/

function logIntermissionState(isIntermission)
{
    isIntermissionLastState = isIntermission;
}

//
// Track board changes
//
function installBoardUpdateHook()
{
    // Subtree monitoring enabled in order to catch changes to the text sub node
    registerMutationObserver('[id=timeleft]', true,
        function(mutations) {

            if (roomIsInitialized)
            {
                var elInputWordField = document.getElementById('word');
                isIntermission   = elInputWordField.disabled;

                if (isIntermissionLastState != isIntermission)
                {
                    if (isIntermission)
                    {
                        console.debug('Entering intermission');
                        // The room has entered intermission, reset the board -- TODO : move to function
                        stopSendingWords();

                        setStatusItemState('statusBoard','init');
                        setStatusItemState('statusWords','init');
                    }
                    else
                    {
                        console.debug('Entering gameplay');
                        // TODO : check time and don't start if it's less than N (30?) seconds
                        // TODO : adjust word sending inverval based on number of words found and total time available (but not less than XXX)
                        // The room has entered active gameplay, TODO : move to function
                        boardNeedsUpdate = true;
                        if (extractBoardToArray())
                            if (findWordsOnBoard())
                                startSendingWords();
                    }
                }

            }

            // store the intermission state for next time
            isIntermissionLastState = isIntermission;

        } ); // End observer callback function
}




function wordListLoad()
{
    wordTree = JSON.parse(GM_getResourceText("resWordTreeJson"));

    if (wordTree)
    {
        console.debug("Dictionary loaded");
        return (true);
    }
    else
    {
        console.debug("Dictionary failed to load! Make sure the script header resource is correct");
        return (false);
    }
}


function appendLink(linkText, linkColor, appendAfterNode, linkFunction)
{
    if (appendAfterNode)
    {
        // Create link to find words on the board
        var Link             = document.createElement('a');
            Link.href        = '#';
            Link.style.color = linkColor;
            Link.onclick     = linkFunction;

        Link.appendChild( document.createTextNode(linkText) );

        // Append the link
        appendAfterNode.parentNode.appendChild(document.createElement('br'));
        appendAfterNode.parentNode.appendChild(Link);
    }
}



function testCreateHeatMapLinks()
{
    appendLink('HM: Used Tiles', 'grey',
               document.getElementById('problems_link'),
               function () {
                   heatMapDrawUsedTiles();
                   return(false); }
              );

    appendLink('HM: Start Tiles', 'grey',
               document.getElementById('problems_link'),
               function () {
                   heatMapDrawStartTiles();
                   return(false); }
              );

    appendLink('HM: End Tiles', 'grey',
               document.getElementById('problems_link'),
               function () {
                   heatMapDrawEndTiles();
                   return(false); }
              );
}



var boardArraySize = 10;
var boardTiles     = [];
var boardTileUsed  = [];
var boardWidth     = -1;
var boardHeight    = -1;

var boardTileStatWordUsedCount  = [];
var boardTileStatStartWordCount = [];
var boardTileStatEndWordCount   = [];
var boardTileStatWordUsedCountMaxVal;
var boardTileStatStartWordCountMaxVal;
var boardTileStatEndWordCountMaxVal;

var wordMinLength  = 4;
var maxWordLen     = 20;

var foundWords     = {}; // TODO ? : = new Object();
var foundWordCount = 0;

var boardNeedsUpdate = true; // TODO : remove?
var wordTree         = null;

var msWaitBetweenWordSendsToGame = 500;// 125 for bot table; // 500; // Half sec average time between sending to game
var continueSendingWords         = false;

var roomIsInitialized       = false;
var isIntermissionLastState = null;
var isIntermission          = null;

var isEnabled               = false;

testCreateHeatMapLinks();

installBoardUpdateHook();


function toggleSending()
{
    if (continueSendingWords)
        stopSendingWords();
    else
        startSendingWords();

   return (false);
}


function toggleEnabled()
{
    isEnabled = !isEnabled;

    if (isEnabled)
        setStatusItemState('statusEnabled','success');
    else
        setStatusItemState('statusEnabled','init');

    return (false);
}


function initStatusArea()
{
    appendMainStatusArea();

    appendStatusItem('statusEnabled','Enabled', toggleEnabled);
    setStatusItemState('statusEnabled','init');

    appendStatusItem('statusRoom','Room', null);
    setStatusItemState('statusRoom','init');

    appendStatusItem('statusDict','Dict', null);
    setStatusItemState('statusDict','init');

    appendStatusItem('statusBoard','Board', null);
    setStatusItemState('statusBoard','init');

    appendStatusItem('statusWords','Words', null);
    setStatusItemState('statusWords','init');

    appendStatusItem('statusSendWords','Send', toggleSending);
    setStatusItemState('statusSendWords','init');
}


initStatusArea();
installRoomInitHook();

//
// Wait for the board settings to appear in the words Element, then try to initialize the room
//
function installRoomInitHook()
{
    // Subtree monitoring enabled in order to catch changes to the text sub node
    registerMutationObserver('[id=words]', true,
        function(mutations)
        {
            // Try to initialize the room
            if (initRoom())
            {
                // If the init succeeded then stop monitoring the words element for mutations
                this.disconnect();
            }
        }
    );
}



function initRoom()
{
    // If this is a room with a board, then initialize
    if (extractBoardSettings())
    {
        setStatusItemState('statusRoom','success');

        // Load the dictionary tree
        if (wordListLoad())
        {
            setStatusItemState('statusDict','success');

            // Signal successful init of room
            roomIsInitialized = true;
            return (true);
        }
        else
        {
            setStatusItemState('statusDict','error');
        }
    }
    else
    {
        setStatusItemState('statusRoom','error');
    }

    // signal failure
    return (false);
}


// -------------- Status area functions

function appendMainStatusArea() //linkText, linkColor, appendAfterNode, linkFunction)
{
    var appendNode = document.getElementById('room_header');

    if (appendNode)
    {
        var elStatus = document.createElement('span');
        elStatus.setAttribute("id", "wordFinderStatusArea");
        appendNode.appendChild(elStatus);
    }
}


function setStatusItemState(itemID, itemStatus)
{
    var elItem = document.getElementById(itemID);

    if (elItem)
    {
        if (itemStatus == "success")
        {
            elItem.style.color           = "white";
            elItem.style.borderColor     = "deepskyblue";
            elItem.style.backgroundColor = "deepskyblue";
        }
        else if (itemStatus == "init")
        {
            elItem.style.color           = "white";
            elItem.style.borderColor     = "lightgrey";
            elItem.style.backgroundColor = "lightgray";
        }
        else if (itemStatus == "error")
        {
            elItem.style.color           = "white";
            elItem.style.borderColor     = "lightcoral";
            elItem.style.backgroundColor = "lightcoral";
        }
    }
}


function appendStatusItem(itemID, itemText, itemFunction)
{
    var appendAfterNode = document.getElementById('wordFinderStatusArea');

    if (appendAfterNode)
    {
        // Create link to find words on the board
        var elNew;
        if (itemFunction)
        {
            elNew = document.createElement('a');
            elNew.href    = '#';
            elNew.onclick = itemFunction;
        }
        else
            elNew = document.createElement('span');

        elNew.id                 = itemID;
        elNew.style.border       = "1px solid";
        elNew.style.padding      = "2px";
        elNew.style.margin       = "3px";
        elNew.style.borderRadius = "4px";

        // Add the text label
        elNew.appendChild( document.createTextNode(itemText) );

        // Append the link
        appendAfterNode.appendChild(elNew);
    }
}




