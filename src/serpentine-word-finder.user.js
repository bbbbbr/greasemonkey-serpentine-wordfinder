// ==UserScript==
// @name        Serpentine Word Finder
// @namespace   http://www.serpentinegame.com/*
// @description Finds words on the Serpentine Game board
// @include     http://*.serpentinegame.com/*
// @include     http://serpentinegame.com/*
// @include     https://*.serpentinegame.com/*
// @include     https://serpentinegame.com/*
// @grant       GM_getResourceText
// @version     0.5.0
// @license     GPL
// @require     dom-utils.js
// @require     word-finder-game-mechanics.js
// @require     word-finder-game-board.js
// @require     word-finder-heatmap.js
// @require     word-finder-word-lookup.js
// @require     word-finder-ui.js
// @resource    resWordTreeJson resource/wordtreejsonEnable172k.js
// ==/UserScript==


/* TODO

* Cleanup
  * Organization
  * Comments
  * Global vars

* Auto adjust send delay based on number of words found and total time available

* OPTIONAL : monitor chat area for commands (enable/disable/set-speed)
* OPTIONAL : Indicate number of words found in UI?
*/


// Settings
var boardArraySize               = 10;
var wordMinLength                = 4;
var maxWordLen                   = 20;
var msWaitBetweenWordSendsToGame = 500; // 500 = Half sec average time between sending to game // 125; for bot table?

// Main status
var roomIsInitialized       = false;


// Start up the script
initWordFinder();



//
// Script main()
// * Called on script startup
//
function initWordFinder()
{
    initUI();

    installRoomInitHook();
}


//
// When first connecting to Serpentine and the game is loading up, this hook will wait for
// the board settings to appear in the UI (#words element) as an indicator that everything
// is ready to go. It then tries to initialize the room/board/gameplay/etc
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


//
// Initializes this Greasemonkey script and tries to set up the room and gameplay
// * Called on script load
//
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

            // Start monitoring the board for updates
            installBoardUpdateHook();
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




