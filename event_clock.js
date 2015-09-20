/**
 * XSplit script for adding a time display suitable for live events.
 * It features both a clock and a day counter: "HH:MM:SS<br>Day N"
 */

'use strict';

/**
 * @name ShowSeconds
 * @label Clock seconds
 * @type boolean
 * @description Show clock seconds
 */
var ShowSeconds = true;

/**
 * @name TextBefore
 * @label Text Before
 * @type text
 * @description Text that will go before the timer
 */
var TextBefore = "";

/**
 * @name TextAfter
 * @label Text After
 * @type text
 * @description Text that will go after the timer
 */
var TextAfter = "";

/**
 * @name DateReference
 * @label Event start date
 * @type date
 * @description Date of the first day, format MM/DD/YYYY
 */
var DateReference = "9/20/2015";

/**
 * @name DayString
 * @label Day text
 * @type text
 * @description Day count text, %N will be replaced by the day number
 */
var DayString = "<br>Dag %N";

/*Do not modify anything below*/
var isPaused = false;
var UPDATEINTERVAL = 500; //0.5 seconds

function getDays(){
	var refParts = DateReference.split("/");
	var ref = new Date(refParts[2] + "," + refParts[0] + "," + refParts[1]);
	var now = Date.now();
	var delta = now - ref;
	var days = Math.floor(delta / (1000 * 3600 * 24));

	if ( days >= 0 ){
		return DayString.replace(/%N/, days + 1);
	} else {
		return '';
	}
}

function getClock(){
	var currentTime = new Date();
	var currentHours = currentTime.getHours();
	var currentMinutes = currentTime.getMinutes();
	var currentSeconds = currentTime.getSeconds();

	/* zeropad */
	currentHours   = ( currentHours   < 10 ? '0' : '' ) + currentHours;
	currentMinutes = ( currentMinutes < 10 ? '0' : '' ) + currentMinutes;
	currentSeconds = ( currentSeconds < 10 ? '0' : '' ) + currentSeconds;

	if ( ShowSeconds ){
		return currentHours + ':' + currentMinutes + ':' + currentSeconds;
	} else {
		return currentHours + ':' + currentMinutes;
	}
}

function updateText(){
	var clock = getClock();
	var days = getDays();

	SetText(TextBefore + clock + days + TextAfter, 'Event Clock');

	smlTitleTimeouts = setTimeout(function() { updateText(); }, UPDATEINTERVAL);
}

var isPreview = false, isThumbnail = false;
var isPreviewID;

if (window.external.GetLocalProperty){
	isPreviewID = window.external.GetLocalPropertyAsync("prop:viewid");
	isThumbnail = window.external.GetGlobalProperty("preview_editor_opened") === 0;
}

function OnSceneLoad(){
	if (window.external.GetLocalProperty){
		isPreview = false;
		isThumbnail = false;
	}
}

var secondsElapsed = 0;
var startPause, endPause;
var browserConfigID;

window.OnAsyncCallback = function(async_id, result){
	result = decodeURIComponent(result);

	if (async_id == isPreviewID){
		isPreview = result == 1;
	} else if (async_id == browserConfigID){
		var config = JSON.parse(result);
		config.isPaused = isPaused.toString();
		window.external.SetLocalPropertyAsync("prop:BrowserConfiguration", JSON.stringify(config));
	}
};

function HandlePostMessage(event){
	if (event.data == "OnSceneLoad"){
		OnSceneLoad();
	} else if (event.data == "TogglePause"){
		TogglePause();
	}
}

if (smlTitleTimeouts && smlTitleTimeouts !== null){
	clearTimeout(smlTitleTimeouts);
}

window.addEventListener('message', HandlePostMessage, false);
updateText();
