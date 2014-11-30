//
// word-finder-gamemechanics.js
//
//
// Functionality for interacting with the Serpentine game and tracking gameplay status



//
// ================= VARS =================
//

var continueSendingWords    = false; // Controls whether found words should be sent to the game
var isIntermissionLastState = null;
var isIntermission          = null;
var isEnabled               = false;



//
// ================= SIMULATED GAMEPLAY AND CONTROL =================
//


//
// Inserts a word into the text input box and pushes the "Send Word" button on the board
//
function pushWordToGame(strWord)
{
    var elWordTextEntry  = document.querySelector("#word");
    var elWordSendButton = document.querySelector("#word_send");

    if ((elWordTextEntry != null) && (elWordSendButton != null))
    {
        elWordTextEntry.value = strWord;
        eventFire( elWordSendButton,'click' );

        return (true); // Word sent successfully
    }
    else
    {
        return (false); // Signal failure to send
    }
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
                if ( pushWordToGame(wordEntry) )
                {
                    // Remove the item from the list if it was sent successfully
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
    setStatusItemState('statusSendWords','enabled');
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
