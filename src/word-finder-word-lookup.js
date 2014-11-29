//
// word-finder-word-lookup.js
//
//
// Loads word trie/radix tree, scans board and builds list of found words



//
// ================= VARS =================
//

var wordTree       = null; // The word trie/radix tree dictionary gets loaded into this var

var boardTileUsed  = [];   // Temporarily flags a given tile as used/available when building a word across the board

var foundWords     = {};   // Hash of words found for the given board (using a hash easily removes dupes) // TODO ? : = new Object();
var foundWordCount = 0;    // Stores the total number of words found for the given board



//
// ================= INIT / RESET =================
//


//
// Attempts to load the JSON formatted trie/radix tree word list / dictionary
// * Expects a Greasemonkey @resource header link named resWordTreeJson
// * Called on script load if a game board/room is detected
// * If loading fails most word finder functionality will remain disabled
//
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


//
// Resets and clears the found word list and number of found words.
// * Called at the start of a new round or if the board is re-scanned for words
//
function resetFoundWordList()
{
    foundWords     = {};
    foundWordCount = 0;
}



//
// ================= WORD CHECK / LOOKUP =================
//


// findWordsOnBoard()
//   |
//   +--> checkBoardTile()
//        ^   |
//        |   +--> checkLetterInWordTree() --> addWordToFoundList()
//        |   |
//        |   +--> checkAdjacentTiles()
//        |                 |
//        +--< recursion <--+


function addWordToFoundList(strWorkString, wordLen)
{
    // Make sure the word meets the minimum length requirement for this room/board in the game
    if (wordLen >= wordMinLength)
    {
        // Make sure the word doesn't already have an entry in the hash list
        if (foundWords.hasOwnProperty(strWorkString) == false)
        {
            // Add the word to the list of found words hash via creating a property/value pair
            foundWords[strWorkString] = true;
            foundWordCount++;

            // Log the word for heat mapping use (will sample the current board usage)
            heatMapIncrementUsedTiles(wordLen);

            return (true); // Success : word added to the list
        }
    }

    return (false); // Failed : word was not added
}

//
// Check all of the adjacent tiles (including diagonals) to see if
// the letters on them would complete or be part of a valid word.
//
function checkAdjacentTiles(cx, cy, wordTreeNode, tileLetter, strWorkString, wordLen)
{
    var x,y;

    // Append the new tile letter to the currently built word
    strWorkString = strWorkString + tileLetter;

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
                    if (wordTreeNode[ tileLetter ])
                        checkBoardTile(x, y, wordTreeNode[ tileLetter ], wordLen, strWorkString);
                }
            }
        }
    }
}


//
// Check to see if the letter for the current tile and letter-in-word position is part of a valid word
//
function checkLetterInWordTree(wordTreeNode, tileLetter, strWorkString, wordLen)
{
    var isLetterPartOfWord = false;

    // Is the current letter present at the current location in the word tree?
    if ( wordTreeNode.hasOwnProperty( tileLetter ) )
    {
        // Append current tile letter to the working string
        strWorkString = strWorkString + tileLetter;

        // indicate success, letter at this location is part of a valid word
        isLetterPartOfWord = true;

        // Check to see if the current string of letters is the last letter which completes a valid word
        if ( wordTreeNode[ tileLetter ]['iw'] )
            addWordToFoundList(strWorkString, wordLen);
    }

    return (isLetterPartOfWord);
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
            if ( checkLetterInWordTree(wordTreeNode[ 'q' ], 'u', strWorkString + 'q', wordLen + 1) )
            {
                // Now check all adjacent tiles, including diagonals
                checkAdjacentTiles(cx, cy, wordTreeNode[ 'q' ], 'u', strWorkString + 'q', wordLen + 1);
            }
        }

        // Now drop through and handle 'q' as a singular letter without the trailing 'u'
        tileLetter = 'q';
    }

    // Test letter and explore further tiles and words if possible
    if ( checkLetterInWordTree(wordTreeNode, tileLetter, strWorkString, wordLen) )
    {
        // Now check all adjacent tiles, including diagonals
        checkAdjacentTiles(cx, cy, wordTreeNode, tileLetter, strWorkString, wordLen);
    }


    // Release tile for use again
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

