var url = require("url");
var clone = require("clone");
var extend = require("extend");
var sortedObject = require("sorted-object");
var baseUrl = url.parse("https://www.streamtext.net/player", true);

// For a list of available query parameters, see
//   https://streamtext.zendesk.com/entries/21721966-controlling-the-streaming-text-page-display
var queryParams = {
    chat: "off",
    header: "off",
    title: "off",
    footer: "off",
    scroll: "off",
    fgc: "fff",
    bgc: "transparent",
    ff: "helvetica,arial,sans-serif",
    fs: "18",
    spacing: "1.8",
    "content-style": "overflow:hidden"
}

function createStreamTextUrl(eventId) {
    urlObj = clone(baseUrl);
    urlObj.query = sortedObject(extend(clone(queryParams), { event: eventId }));
    return url.format(urlObj);
}

var streamTextUrl = url.parse(window.prompt("Enter URL"), true);
var iframe = document.createElement("iframe");
iframe.src = createStreamTextUrl(streamTextUrl.query.event);
iframe.className = "content";
iframe.id = "stream-text-embed";
document.getElementById("stream-text-container").appendChild(iframe);
