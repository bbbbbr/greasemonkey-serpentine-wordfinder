// word-finder-game-board.js
//
//
// Functionality for detecting the board settings and screen-scraping the game tiles


//
// ================= VARS =================
//


var boardTiles     = [];   // Stores the letter used for each tile on the board
var boardWidth     = -1;   // Record keeping for how large the current board is (width & height)
var boardHeight    = -1;

var boardNeedsUpdate = true; // TODO : remove?



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


