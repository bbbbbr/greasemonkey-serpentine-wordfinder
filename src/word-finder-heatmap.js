//
// word-finder-heatmap.js
//
//
// Generates usage heat map for board tiles based on words found



//
// ================= VARS =================
//

// Arrays used to record tile-in-word/etc usage statistics for each tile on the board
var boardTileStatWordUsedCount  = [];
var boardTileStatStartWordCount = [];
var boardTileStatEndWordCount   = [];

// Helper vars to simplify post-board scan display processing. Each stores the value of the most-used tile for the matching array
var boardTileStatWordUsedCountMaxVal;
var boardTileStatStartWordCountMaxVal;
var boardTileStatEndWordCountMaxVal;


//
// ================= INIT AND DATA LOGGING =================
//


//
// Reset array and counters for collecting tile usage data
//
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


//
// Updates the heat map with the set of tiles used by a word
//
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



//
// ================= DISPLAY FUNCTIONS =================
//


//
// Displays a heatmap of which tiles are most frequently used
//
function heatMapDrawUsedTiles()
{
    heatMapDrawToBoard(boardTileStatWordUsedCount, boardTileStatWordUsedCountMaxVal);

    return (false); // for onClick return handling
}


//
// Displays a heatmap of which *starting* tiles are most frequently used
//
function heatMapDrawStartTiles()
{
    heatMapDrawToBoard(boardTileStatStartWordCount, boardTileStatStartWordCountMaxVal);

    return (false); // for onClick return handling
}


//
// Displays a heatmap of which *ending* tiles are most frequently used
//
function heatMapDrawEndTiles()
{
    heatMapDrawToBoard(boardTileStatEndWordCount, boardTileStatEndWordCountMaxVal);

    return (false); // for onClick return handling
}


//
// Render a heatmap on the board by setting tile background color based on usage from a given array
//
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
