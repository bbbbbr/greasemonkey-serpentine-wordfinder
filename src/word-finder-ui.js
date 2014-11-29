//
// word-finder-UI.js
//
//
// UI tools and controls



//
// ================= VARS =================
//




//
// ================= INTERACTION =================
//


//
// Toggles/controls whether words found on the board are sent to the game
// * Can be used to abort or re-start sending words for the current round
//
function toggleSending()
{
    if (continueSendingWords)
        stopSendingWords();
    else
        startSendingWords();

   return (false); // for onClick return handling
}


//
// Toggles/controls whether game play is enabled or not
// * If gameplay is not enabled at the start of a new round then no found words
//   will be sent (the board will still be updated and checked for words).
//
function toggleEnabled()
{
    isEnabled = !isEnabled;

    if (isEnabled)
        setStatusItemState('statusEnabled','success');
    else
        setStatusItemState('statusEnabled','init');

    return (false); // for onClick return handling
}



//
// ================= UI CREATION =================
//


//
// Initializes the UI elements
//
function initUI()
{
    initHeatMapArea();
    initStatusArea();
}


//
// Creates the main word-finder status area/UI
//
function appendMainStatusArea()
{
    var appendNode = document.getElementById('room_header');

    if (appendNode)
    {
        var elStatus = document.createElement('span');
        elStatus.setAttribute("id", "wordFinderStatusArea");
        appendNode.appendChild(elStatus);
    }
}


//
// Creates status indicators and buttons for controlling this Greasemonkey script
//
function initStatusArea()
{
    appendMainStatusArea();

    appendStatusItem('wordFinderStatusArea', 'statusEnabled','Enabled', toggleEnabled);
    setStatusItemState('statusEnabled','init');

    appendStatusItem('wordFinderStatusArea', 'statusRoom','Room', null);
    setStatusItemState('statusRoom','init');

    appendStatusItem('wordFinderStatusArea', 'statusDict','Dict', null);
    setStatusItemState('statusDict','init');

    appendStatusItem('wordFinderStatusArea', 'statusBoard','Board', null);
    setStatusItemState('statusBoard','init');

    appendStatusItem('wordFinderStatusArea', 'statusWords','Words', null);
    setStatusItemState('statusWords','init');

    appendStatusItem('wordFinderStatusArea', 'statusSendWords','Send', toggleSending);
    setStatusItemState('statusSendWords','init');
}


//
// Creates the heat map button area
//
function appendHeapMapArea()
{
    var appendNode = document.getElementById('room_header');

    if (appendNode)
    {
        var elSpan = document.createElement('span');
        elSpan.setAttribute("id", "wordFinderHeatMapArea");
        elSpan.style.cssFloat = "right";
        appendNode.appendChild(elSpan);
    }
}


//
// Creates buttons for toggling the found-word heatmaps
//
function initHeatMapArea()
{
    appendHeapMapArea();

    // Heat Map buttons
    appendStatusItem('wordFinderHeatMapArea', 'heatmapLabel','HeatMap :', null);
    setStatusItemState('heatmapLabel','label');

    appendStatusItem('heatmapLabel', 'heatmapUsedTiles', 'Used',  heatMapDrawUsedTiles);
    setStatusItemState('heatmapUsedTiles','success');

    appendStatusItem('heatmapLabel', 'heatmapStartTiles','Start', heatMapDrawStartTiles);
    setStatusItemState('heatmapStartTiles','success');

    appendStatusItem('heatmapLabel', 'heatmapEndTiles',  'End',   heatMapDrawEndTiles);
    setStatusItemState('heatmapEndTiles','success');
}



//
// ================= UI HELPERS =================
//


//
// Adds a text or anchor link item to the word-finder status area/UI
//
function appendStatusItem(parentID, itemID, itemText, itemFunction)
{
    var appendAfterNode = document.getElementById(parentID);

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


//
// Toggles a UI control's status and state
//
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
        else if (itemStatus == "label")
        {
            elItem.style.color           = "darkgrey";
            elItem.style.borderColor     = "transparent";
            elItem.style.backgroundColor = "transparent";
        }
    }
}









