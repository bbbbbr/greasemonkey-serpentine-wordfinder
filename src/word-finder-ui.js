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

   return (false);
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

    return (false);
}



//
// ================= UI CREATION =================
//


//
// Creates the (main) word-finder status area/UI
//
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


//
// Creates status indicators and buttons for controlling this Greasemonkey script
//
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


//
// ================= UI HELPERS =================
//


// TODO : remove?
//
// Appends an anchor link (text, color, onClick handler function) to an element
//
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


//
// Adds a text or anchor link item to the word-finder status area/UI
//
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
    }
}









