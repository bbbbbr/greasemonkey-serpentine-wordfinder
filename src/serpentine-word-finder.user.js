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
// @require     dom-utils.js
// @require     word-finder-game-mechanics.js
// @require     word-finder-heatmap.js
// @require     word-finder-word-lookup.js
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




// Settings
var boardArraySize = 10;
var wordMinLength  = 4;
var maxWordLen     = 20;


var boardNeedsUpdate = true; // TODO : remove?


var msWaitBetweenWordSendsToGame = 500;// 125 for bot table; // 500; // Half sec average time between sending to game
var continueSendingWords         = false;

var roomIsInitialized       = false;
var isIntermissionLastState = null;
var isIntermission          = null;

var isEnabled               = false;

CreateHeatMapLinks();

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




