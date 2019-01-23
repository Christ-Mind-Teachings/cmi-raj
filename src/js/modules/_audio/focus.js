/*
  highlight and scroll paragraph being spoken during audio playback

  Supports:
    play-from-here
*/

import scroll from "scroll-into-view";
import {fetchTimingData} from "../_config/config";
import _findLastIndex from "lodash/findLastIndex";
import _map from "lodash/map";
import {setCaptureData} from "./capture";

//paragraph timing array assigned on module initialization
let timingData = null;
let notifyParagraphChange = null;
let notifyPlaybackTime = null;

//capture.js can disable scroll is timing is enabled
let scrollEnabled = true;

class Ptr {
  constructor(value = -1, pvalue = -1) {
    this.val = value;
    this.pval = pvalue; //previous ptr position
  }

  //get val
  get ptrVal() {
    return this.val;
  }

  //set val
  set ptrVal(value) {
    this.val = value;
    //console.log("set ptr: %s", this.val);
  }

  //get previous val
  get pVal() {
    return this.pval;
  }

  //set previous val
  set pVal(value) {
    this.pval = value;
    //console.log("set prevPtr: %s", this.pval);
  }

  //increment val
  set inc(value = 1) {
    this.val = this.val + value;
    //console.log("inc ptr: %s", this.val);
  }
}

//pointers to the current and previous paragraphs
const ptr = new Ptr(-1, -1);

let seeking = false;
let ended = false;
let player;

export function registerNotify(fn) {
  notifyParagraphChange = fn;
}

export function registerNotifyPlaybackTime(fn) {
  notifyPlaybackTime = fn;
}

export function getCurrentParagraph() {
  return {
    pid: ptr.val,
    startTime: getTime(ptr.val),
    nextStartTime: getTime(ptr.val + 1)
  };
}

/*
 * init playFromHere
 */
function initializePlayFromHere() {
  //initially hide playmark icon added next
  $(".transcript.ui.text.container").addClass("hide-playmark");

  // add 'play' markers to each paragraph
  $("p.cmiTranPara").each(function() {
    $(this).prepend("<i class='playmark play icon'></i>");
  });

  //create listener
  $(".transcript.ui.text.container").on("click","p.cmiTranPara > i.playmark.icon", function(e) {
    e.preventDefault();
    let el = $(this);
    let id = el.parent().attr("id");

    switchToParagraph(id);
  });
}

/*
  called by play-from-here event handlers
*/
export function switchToParagraph(p) {
  let time;
  let idx;
  //console.log("switchToParagraph: %s", p);
  switch(p) {
    case "NEXT":
      if ((ptr.val + 1) < timingData.length) {
        time = getTime(ptr.val + 1);
        adjustPlayPosition(ptr.val + 1);
        player.setCurrentTime(time);
      }
      break;
    case "PREV":
      if ((ptr.val - 1) >= 0) {
        time = getTime(ptr.val - 1);
        adjustPlayPosition(ptr.val - 1);
        player.setCurrentTime(time);
      }
      break;
    default:
      idx = parseInt(p.substr(1),10);
      time = getTime(idx);

      //set new playtime
      if (time > -1) {
        adjustPlayPosition(idx);
        player.setCurrentTime(time);
        if (player.paused) {
          player.play();
        }
      }
      break;
  }
}

//remove highlighting from currently highlighted paragraph
function removeCurrentHilight() {
  if (ptr.pval > -1) {
    $("#" + timingData[ptr.pval].id).removeClass("hilight");
  }
}

/*
 * Toggle display of play-from-here controls
 */
export function togglePlayFromHere() {
  let el = $(".transcript.ui.text.container");

  if (el.hasClass("hide-playmark")) {
    el.removeClass("hide-playmark");
    return true;
  }
  else {
    el.addClass("hide-playmark");
    return false;
  }
}

//round audio timing data to two decimal places
function round(time) {
  return Math.round(time * 100) / 100;
}

function getIndex(time) {
  let index = _findLastIndex(timingData, (o) => {
    //console.log(`findLastIndex: checking ${o.id}, ${o.seconds} <= ${time}`);
    return o.seconds <= time;
  });

  //console.log("found: %s", index);
  return index;
}

function getTime(idx) {
  if (idx < 0 || idx >= timingData.length ) {
    return 60 * 60 * 24; //return a big number
  }
  else {
    //console.log("getTime(%s)", idx);
    return timingData[idx].seconds;
  }
}

function manageHiLight(current) {

  //initial state of pointer is -1
  if ((ptr.val === -1) || current > getTime(ptr.val + 1)) {
    ptr.inc = 1;
    if (!seeking) {
      showNscroll(ptr.val);
    }
  }
}

/*
 * User seeked behind the current play position
 * - adjust hilight accordingly
 */
function adjustPlayPosition(index) {
  //console.log(`adjusting play position to: p${index}`)
  ptr.val = index;
  showNscroll(ptr.val);
}

function showNscroll(idx) {
  var tinfo = timingData[idx];
  //console.log("hilight transition at time %s to paragraph %s", current, tinfo.id);

  //scroll into view
  if (scrollEnabled) {
    scroll(document.getElementById(tinfo.id));
  }

  if (ptr.pval > -1) {
    $("#" + timingData[ptr.pval].id).removeClass("hilight");
  }

  $("#" + tinfo.id).addClass("hilight");
  ptr.pval = idx;

  if (notifyParagraphChange) {
    notifyParagraphChange({
      pid: tinfo.id,
      startTime: tinfo.seconds,
      nextStartTime: idx < timingData.length ? timingData[idx + 1].seconds : player.duration
    });
  }
}

export default {

  /*
    args:
      timingDataUri: name of timing data to fetch
      p: reference to the audio player
      userStatus: when equal TIMER send timing data to capture.js
  */
  initialize: function(timingDataUri, p, userStatus) {
    player = p;
    
    //load the timing data
    fetchTimingData(timingDataUri)
      .then((data) => {

        //round timing data to two decimal places
        timingData = _map(data.time, function(value) {
          value.seconds = round(value.seconds);
          return value;
        });

        initializePlayFromHere();

        if (userStatus === "TIMER") {
          setCaptureData(timingData);
        }
      })
      .catch((error) => {
        console.error("Failed to load timing data: %s, error: ", timingDataUri, error);
      });
  },

  /*
    This is called every 250ms from the audio player and used to adjust the
    highlight whenever a new paragraph has started
  */
  setCurrentPlaybackTime: function(time) {
    if (timingData) {
      manageHiLight(round(time));
    }

    if (notifyPlaybackTime) {
      notifyPlaybackTime(time);
    }
  },

  /*
    called each time the play button is pressed
  */
  play: function() {

    //if ended is true, the audio is being replayed
    // - set pointers and flags to default values
    if (ended) {
      ptr.val = -1;
      ptr.pval = -1;
      seeking = false;
      ended = false;
      //console.log("audio restarting");
    }
  },

  /* 
    called each time the pause button is pressed
  */
  pause: function() {
    //console.log("audio paused");
  },

  /*
    When audio has ended we remove highlight from the last paragraph
    and set the ended flag to true. We set the flag so the setSeeked() 
    event, which is called when the audio ends, will exit the function
    without action. If we don't do this, when the audio ends, the transcript
    is scrolled to the top and the first paragraph highlighted.
  */
  ended: function() {
    if (!timingData) {
      return;
    }
    ended = true;
    //console.log("play ended");

    //remove hilight
    removeCurrentHilight();
  },

  //seeking started
  setSeeking: function() {
    if (!timingData) {
      return;
    }
    //disable hilight event handling
    seeking = true;
  },

  /*
    Seeking ended, adjust current paragraph and highlighting accordingly
  */
  setSeeked: function(time) {
    if (!timingData) {
      return;
    }

    seeking = false;

    //setSeeked() is called when audio has ended. We don't want to 
    //do anything in that case
    if (ended) {
      return;
    }

    var index = getIndex(round(time));

    //console.log("seeked from %s to %s", ptr.val, index);
    adjustPlayPosition(index);
  }

};

/*
  called by capture when capture of existing timing
  is happening
*/
export function disableScroll() {
  scrollEnabled = false;
}

