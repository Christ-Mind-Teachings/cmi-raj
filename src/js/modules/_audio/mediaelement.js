
//media elements plugin and css
import "mediaelement";
import "mediaelement/build/mediaelementplayer.css";

//media elements plugins ------
import "me-plugin/jump-forward/jump-forward.css";
import "me-plugin/jump-forward/jump-forward";

import "me-plugin/skip-back/skip-back.css";
import "me-plugin/skip-back/skip-back";

import "me-plugin/speed/speed.css";
import "me-plugin/speed/speed";

import "me-plugin/nextp/nextp.css";
import "me-plugin/nextp/nextp";

import "me-plugin/prevp/prevp.css";
import "me-plugin/prevp/prevp";

import "me-plugin/ptoggle/ptoggle.css";
import "me-plugin/ptoggle/ptoggle";

import "me-plugin/capture/capture.css";
import "me-plugin/capture/capture";
//-----------------------------

import notify from "toastr";
import focus, {switchToParagraph, togglePlayFromHere} from "./focus";
import {getUserInfo} from "../_user/netlify";
import {getReservation} from "../_config/config";

import timeCapture from "./capture";

/*
  This is called after successful audio player initialization
*/
function setEventListeners(player, userStatus, haveTimingData) {
  //console.log("userStatus: %s, haveTimingData: %s", userStatus, haveTimingData !== undefined);
  let capture = false;

  //initialize focus
  if (haveTimingData) {
    focus.initialize(haveTimingData, player, userStatus);

    //play from here toggle
    $(".mejs__ptoggle").addClass("mejs-ptoggle-hidden");
  }

  //initialize time capture and, if we have timing data, time capture editing
  if (userStatus === "TIMER") {
    capture = true;
    timeCapture.initialize(player, haveTimingData);
  }

  /*
    seems to be called only once with readyState = 3 or 4

    Have this here to research a way to indicate when audio is ready to be played
    - eg: could indicate load and clear the indicator when this event is called
  player.media.addEventListener("canplay", function() {
    console.log("Media ready for playing: readyState: %s", player.readyState);
  });
  */

  /*
    Communicate current audio playback time to focus and capture
  */
  player.media.addEventListener("timeupdate", function() {
    var time = player.getCurrentTime();

    if (haveTimingData) {
      focus.setCurrentPlaybackTime(time);
    }

    if (capture) {
      timeCapture.setCurrentPlaybackTime(time);
    }
  });

  /*
   * play has started.
  */
  player.media.addEventListener("playing", function() {
    if (haveTimingData) {
      focus.play();
    }

    if (capture) {
      timeCapture.play();
    }
  });

  /*
    * Notify focus or timeCapture audio playback has ended
    */
  player.media.addEventListener("ended", function() {
    if (haveTimingData) {
      focus.ended();
    }

    if (capture) {
      timeCapture.ended();
    }
  });

  player.media.addEventListener("pause", function() {
    if (haveTimingData) {
      focus.pause();
    }

    if (capture) {
      timeCapture.pause();
    }
  });

  if (haveTimingData) {
    player.media.addEventListener("ptoggle", function() {
      if (togglePlayFromHere()) {
        $(".mejs__ptoggle").addClass("mejs-ptoggle-visible").removeClass("mejs-ptoggle-hidden");
      }      
      else {
        $(".mejs__ptoggle").addClass("mejs-ptoggle-hidden").removeClass("mejs-ptoggle-visible");
      }
    });

    /* don't think we need this when we have timing data
    //get notified when seek start
    player.media.addEventListener("seeking", function() {
      var time = player.getCurrentTime();
      focus.setSeeking(time);
    });

    //get notified when seek ended
    player.media.addEventListener("seeked", function() {
      var time = player.getCurrentTime();
      focus.setSeeked(time);
    });
    */

    player.media.addEventListener("prevp", function() {
      switchToParagraph("PREV");
    });

    player.media.addEventListener("nextp", function() {
      switchToParagraph("NEXT");
    });
  }

  if (capture) {
    //Audio player control that shows/hides time capture icon
    player.media.addEventListener("capture", function() {
      timeCapture.toggleMarkers();
    });
  }
}

/*
  A user is either a LISTENER or a TIMER. TIMER's are logged in and have a role of "timer",
  additionally, if there is a reservation the timer is a timer only when the reservation
  is for him.
*/
function getUserStatus() {
  let user = getUserInfo();

  if (!user) {
    return "LISTENER";
  }
  //console.log("userInfo: ", user);

  //not all users have a role defined
  if (!user.roles) {
    return "LISTENER";
  }

  let timer = user.roles.find(r => r === "timer");
  let editor = user.roles.find(r => r === "editor");

  if (!timer && !editor) {
    return "LISTENER";
  }

  //User is a timer, check there is a timing reservation on the page
  let reservation = getReservation(location.pathname);

  //no reservation, the user is a timer
  if (!reservation) {
    return "TIMER";  
  }

  //check if reservation is for the user
  if (reservation === user.email) {
    return "TIMER";
  }
  //editors can time even if a reservation is held by someone else
  else if (editor) {
    return "TIMER";
  }

  //user is a timer but does not have a reservation
  return "LISTENER";
}

/*
  Determine audio player controls to use, we enable timing if timing data exists or not.
*/
function assignPlayerFeatures(timingData) {
  let info = {
    status: getUserStatus(),
    features: []
  };

  if (info.status === "LISTENER") {
    if (timingData) {
      info.features = ["playpause", "current", "duration", "prevp", "nextp", "ptoggle"];
    }
    else {
      info.features = ["playpause", "current", "duration", "skipback", "jumpforward"];
    }

  }
  //TIMER
  else {
    if (timingData) {
      info.features = ["playpause", "current", "duration", "prevp", "nextp", "ptoggle", "capture", "speed"];
    }
    else {
      info.features = ["playpause", "current", "duration", "skipback", "jumpforward", "capture", "speed"];
    }
  }

  return info;
}

export default {

  /*
   * initialize audio player:
   *
   * args:
   *  src: url of audio file
   *  timingData: uri of timing data, pass it to focus.js
   */
  initialize: function(src, timingData) {
    //add source of audio file to player
    $("audio.mejs-player").attr("src", src);

    const {status, features} = assignPlayerFeatures(timingData);

    $("#cmi-audio-player").mediaelementplayer({
      pluginPath: "/public/vendor/mediaelement/plugin/",
      skipBackInterval: 15,
      jumpForwardInterval: 15,
      timeFormat: "h:mm:ss",
      features: features,
      error: function(error) {
        notify.error("Audio error: ", error);
      },
      success: function(media, node, player) {
        //setup for capture and focus
        setEventListeners(player, status, timingData);
      }
    });
  }
};

