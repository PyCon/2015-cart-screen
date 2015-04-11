"use strict";

var _ = require("lodash");
var domready = require("domready");
var Firebase = require("firebase");
var http = require("http-browserify");
var moment = require("moment-timezone");
var sortedObject = require("sorted-object");
var talkInfo = require("./talk-info.hbs");
var url = require("url");

var baseUrl = url.parse("https://www.streamtext.net/player", true);
// Because https://us.ycon.org does not set CORS headers, we have our own copy
// of the conference data.
var conferenceJsonUrl = "static/conference.json";  // eslint-disable-line no-unused-vars

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
    var urlObj = _.clone(baseUrl);
    urlObj.query = sortedObject(_.extend(_.clone(queryParams), { event: eventId }));
    return url.format(urlObj);
}

function extractEventId(streamTextUrl) {
    var urlObj = url.parse(streamTextUrl, true);
    return urlObj.query.event;
}

function normalizeRoomName(room) {
    return room.toLowerCase().replace("room ", "");
}

function montreal(mmnt) { return mmnt.tz("America/Montreal"); }
// function now() { return montreal(moment("2015-04-10T16:35:00")); }  // for testing
function now() { return montreal(moment()); }
function findCurrentTalk(talks) {
    return _.find(talks, function (talk) {
        var start = montreal(moment(talk.start));
        var end = montreal(moment(talk.end));
        return now().isBetween(start.subtract(5, "minutes"), end.add(5, "minutes"));
    });
}

function getTalksForRoom(room, allTalks) {
    var keyedTalks = _.groupBy(allTalks, function(talk) { return normalizeRoomName(talk.room); });
    return keyedTalks[room];
}

function createSpeakerInfoDiv(authors, title) {
    return talkInfo({title: title, authors: authors.join(", ")});
}

function fillTalkInfo(talk) {
    document.getElementById("talk-info-container").innerHTML = createSpeakerInfoDiv(talk.authors, talk.name);
}

function getEventId() {
    return extractEventId(window.prompt("Enter URL"));  // eslint-disable-line no-alert
}

function setCurrentEvent(eventId) {
    document.getElementById("stream-text-embed").src = createStreamTextUrl(eventId);
}

function getCurrentEvent() {
    return url.parse(document.getElementById("stream-text-embed").src, true).query.event;
}

domready(function() {
    var room = url.parse(window.location.href, true).query.room;
    http.get(url.resolve(window.location.href, conferenceJsonUrl), function (res) {
        var data = [];
        res.on("data", function(buf) { data.push(buf); });
        res.on("end", function() {
            var allTalks = JSON.parse(data.join(""));
            var roomTalks = getTalksForRoom(room, allTalks);
            var currentTalk = findCurrentTalk(roomTalks);
            fillTalkInfo(currentTalk);
        });
        res.on("error", function(e) { console.log(e); });
    });

    var ref = new Firebase("https://radiant-heat-9304.firebaseio.com/rooms/" + room);
    var eventIdRef = ref.child("event-id");
    var mostRecentRef = ref.child("most-recent-event-id");
    var lastCheckinRef = ref.child("last-checkin");

    eventIdRef.on("value", function(snapshot) {
        console.log(snapshot.val());
        mostRecentRef.set(snapshot.val());
        setCurrentEvent(snapshot.val());
    });
    window.setInterval(function() {
        lastCheckinRef.set(montreal(now()).format("LTS"));
        mostRecentRef.set(getCurrentEvent());
    }, 5000 /* 5 seconds */);
});
