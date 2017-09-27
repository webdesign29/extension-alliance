chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("scripsdts/inject.js");
		// ----------------------------------------------------------

	}
	}, 10);
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	if (request.cmd == "getHTML") {
	  sendResponse({ result: document.documentElement.innerHTML });
	} else {
	  sendResponse({ result: document.documentElement.innerHTML });
	}
	// Note: Returning true is required here!
	//  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
	return true; 
});