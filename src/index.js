(function() {  // IIFE

"use strict";
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
    fs: "42",
    spacing: "1.8",
    "content-style": "overflow:hidden; text-transform: uppercase"
};

function createStreamTextUrl(eventId) {
    var urlObj = clone(baseUrl);
    urlObj.query = sortedObject(extend(clone(queryParams), { event: eventId }));
    return url.format(urlObj);
}

function extractEventId(streamTextUrl) {
    var urlObj = url.parse(streamTextUrl, true);
    return urlObj.query.event;
}

function createIframe(streamTextUrl) {
    var iframe = document.createElement("iframe");
    iframe.src = streamTextUrl;
    iframe.className = "content";
    iframe.id = "stream-text-embed";
    return iframe;
}

function getStreamTextUrl() {
    var inputUrl = window.prompt("Enter URL");  // eslint-disable-line no-alert
    return createStreamTextUrl(extractEventId(inputUrl, true));
}

document.getElementById("stream-text-container").appendChild(createIframe(getStreamTextUrl()));

})();  // IIFE
