//
// word-finder-gamemechanics.js
//
//
// Functionality for interacting with the Serpentine game



//
// ================= VARS =================
//

var boardTiles     = [];   // Stores the letter used for each tile on the board
var boardWidth     = -1;   // Record keeping for how large the current board is (width & height)
var boardHeight    = -1;

var boardNeedsUpdate        = true; // TODO : remove?
var continueSendingWords    = false;
var roomIsInitialized       = false;
var isIntermissionLastState = null;
var isIntermission          = null;
var isEnabled               = false;


//
// ================= INIT =================
//

//
// Initializes and clears the 2D array used for storing board tiles
// TODO : pass in params instead of globalizing them
//
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
// ================= SIMULATED GAMEPLAY AND CONTROL =================
//


//
// Inserts a word into the text input box and pushes the "Send Word" button on the board
//
function pushWordToGame(strWord)
{
    // TODO : check querySelector values for NULL and signal failure if needed, then bubble up and don't delete word if failed
    document.querySelector("#word").value = strWord;
    eventFire( document.querySelector("#word_send") ,'click');
}


//
// Iterates over the list of found words and tries to send the first available (previously unsent) word
//
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


//
// Trickle-sends the found words to the game using a periodic timer to delay between each send
//
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


//
// Wrapper to trigger the start of sending words
//
function startSendingWords()
{
    setStatusItemState('statusSendWords','success');
    continueSendingWords = true;
    sendWordListOnTimer(msWaitBetweenWordSendsToGame);
}

//
// Wrapper to stop sending words of any words
//
function stopSendingWords()
{
    continueSendingWords = false;
    setStatusItemState('statusSendWords','init');
}



//
// ================= GAME BOARD SCRAPING =================
//


//
// Finds the letters on each tile of the board and stores them to a 2D array for processing
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



//
// ================= GAME SETTINGS =================
//


// OPTIONAL : rename to Room Settings?
//
// Attempts to extract game/board settings from the game UI
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



//
// ================= GAME STATUS TRACKING =================
//

/*
TODO
function checkTime() {
    var tileNodes = document.querySelectorAll('[id=timeleft]');
    if (tileNodes != null) {

    }
}
*/


//
// Wrapper to update whether gameplay is active or not (intermission)
//
function logIntermissionState(isIntermission)
{
    isIntermissionLastState = isIntermission;
}


//
// Monitors the game UI to keep track of whether a game is in play or not
// * The "time left" UI element (which updates once a second) is used as a trigger to check the current gameplay status
// * The text entry field (#word) is used to determine whether gameplay is active (text field == enabled) or not (text field == disabled)
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
