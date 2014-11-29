//
// dom-utils.js
//
//
// Misc. tools for interacting with the DOM



//
// Triggers an event handler (such as onClick) for an element
//
function eventFire(el, etype)
{
    if (el.fireEvent)
    {
        el.fireEvent('on' + etype);
    }
    else
    {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
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

