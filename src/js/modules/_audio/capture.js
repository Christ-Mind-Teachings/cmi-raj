/*
 * 
 * This allows the user to capture the audio playback time at the start of each
 * paragraph. 
 * 
 * Each paragraph under .cmiTranPara, for transcripts containing audio and that have not yet
 * been timed, have a bullseye icon inserted at the beginning. When audio is played, pressing
 * the 'C' on the audio player displays the bullseye.
 * 
 * When clicked, the bullseye becomes a check mark indicating time has been captured. Whe clicked
 * again the check mark becomes a bullseye. Data is stored in local storage while it is being 
 * collected and can be restored if the timing session is interrupted before the data is submitted.
 * 
 * A bullseye is clicked when the audio is transitioning between paragrapsh - in the gap between
 * the previous paragraph and before the current. When all paragraphs have been clicked and the audio
 * ends, the timing submission form if displayed automatically. The user just submits the form and
 * the timing data ends up being emailed to the recipient as configured with Netlify.
 * 
 * If the submit fails, the timing data is stored in local storage and the form is automatically
 * displayed when the page is refreshed or returned to at a later time.
 * 
 * Requirements to capture
 * 
 * 1. be logged in with role of "timer"
 * 2. the transcript is reserved for timing by the one logged in or not reserved
 * 
 */

import CaptureData from "./captureData";
import notify from "toastr";
import store from "store";
import {getUserInfo} from "www/modules/_user/netlify";
import scroll from "scroll-into-view";
import {disableScroll} from "./focus";

/*
  if a timer closes the submit form without pressing submit the data 
  will be lost. So we check for this condition and warn them once
*/
let posted = false;
let warned = false;

let captureData;
let audioPlayer;

let audioPlaying = false;
let captureRequested = false;
let captureId = "";
let markerIcon = "bullseye";

const uiTimeCaptureModal = ".timecapture.ui.modal";
const uiModalOpacity = 0.5;

let timingData = null;
let haveTimingData = false;
let editInitialized = false;

/*
  If we have timing data and we haven't initialized then
  request confirmation from user they want to take timing.
  If response is yes
    initialize and
    return true
  if response is no
    return false
  
  If we don't have timing data 
    return true
*/
function initializeEdit() {
  return new Promise((resolve, reject) => {
    if (!haveTimingData) {
      resolve(true);
      return;
    }
    else {
      if (haveTimingData && editInitialized) {
        resolve(true);
        return;
      }

      //display modal
      $(".time-edit-modal.ui.modal")
        .modal({
          dimmerSettings: {opacity: 0.5},
          closable  : false,
          onDeny    : function(){
            resolve(false);
          },
          onApprove: function() {
            //check current timing has the correct number of data points
            let noOfParagraphs = $("p.cmiTranPara").length;
            
            if (noOfParagraphs !== timingData.length) {
              notify.error("Unexpected number of data points in existing timing data, please inform Rick, Can't capture time until this is resolved.");
              resolve(false);
              return;
            }

            restoreState();

            //disable scroll when timing enabled
            disableScroll();
            editInitialized = true;
            resolve(true);
          }
        })
        .modal("show");
    }
  });
}

/*
  This function called from focus.js after timing data has been fetched and
  the user is a TIMER. This allows user to modify existing timing data which
  is sometimes needed due to previously inadequate job.
*/
export function setCaptureData(data) {
  //console.log("capture: timing data received");
  timingData = data;
}

/*
  save in-progress time capture data
*/
function captureProgress(operation) {
  if (operation === "SAVE") {
    store.set(`$captureData-${location.pathname}`, captureData.getData());
  }
  else if (operation === "REMOVE") {
    store.remove(`$captureData-${location.pathname}`);
  }
}

/*
 * Capture time for a given paragraph - programatically
 * args: o - time stamp, {pid, seconds}
 *       save - boolean, indicates of time should be saved to local store by markParagraph
 */
function autoCapture(o, save = true) {
  captureRequested = true;
  markParagraph(o, save);
}

/*
  mark paragraphs during time collection. 

  Initially the marker is a bullseye or clock, a clock is used when we have
  timing data previously collected, otherwise we use a bullseye.

  When a marker is clicked it becomes a 'check' to indicate time was collected. When
  the 'check' is clicked the data point for that paragraph is deleted and the 
  marker is set to a 'bullseye' to indicate we don't have a time point for the
  paragraph. 
*/
function markParagraph(o, save = true) {
  var pi = $("#" + o.id).children("i.timing");

  //console.log("markParagraph: ");
  if (!captureRequested) {
    return;
  }

  //mark as captured
  if (pi.hasClass(markerIcon)) {
    pi.removeClass(markerIcon).addClass("check");
    captureData.add(o);

    if (save) {
      captureProgress("SAVE");
    }
  }
  else if (pi.hasClass("bullseye")) {
    pi.removeClass("bullseye").addClass("check");
    captureData.add(o);
    if (save) {
      captureProgress("SAVE");
    }
  }
  //user clicked a captured paragraph, mark for delete
  else if (pi.hasClass("check")) {
    pi.removeClass("check").addClass("bullseye");
    captureData.remove(o);
    if (save) {
      captureProgress("SAVE");
    }
  }

  captureRequested = false;
}

/*
 * Time capture listener
 * - listen for user click on bullseye or check mark and 
 *   set captureRequested flag
 */
function createListener() {
  //create listener
  $(".transcript.ui.text.container").on("click","p.cmiTranPara > i.timing.icon", function(e) {
    e.preventDefault();

    if (audioPlaying) {
      captureRequested = true;
      captureId = e.target.parentElement.id;
    }
    else {
      notify.info("Click is ignored when audio is not playing.");
    }
  });

  //initialize time capture modal
  $(uiTimeCaptureModal).modal({
    dimmerSettings: {opacity: uiModalOpacity},
    closable: false,
    onHide: function() {
      if (!posted && !warned) {
        notify.warning("Warning, your timing data will be lost if you close the window without submitting the data.", "Your Data Will Be Lost", {timeOut: 10000, closeButton: true});
        warned = true;
        return false;
      }
    }
  });

  //time submit form in modal window
  $("#audio-data-form").submit(function(e) {
    e.preventDefault();
    posted = true;
    //console.log("submit pressed");

    let $form = $(this);
    $.post($form.attr("action"), $form.serialize())
      .done(function() {
        notify.success("Thank you! The data was submitted successfully.");
        $(uiTimeCaptureModal).modal("hide");
        toggleMarkers();

        //if there was a previously failed submit - remove it
        store.remove(`captureData-${location.pathname}`);
      })
      .fail(function(e) {
        notify.error("Sorry, submit failed.");
        $("#audio-data-form .ui.message").addClass("negative").html(
          `<div class="header">Drat! Your submit failed.</div>
           <p>To re-submit, try to refresh the page or return at a later time.
           The data will not be lost. This form will be displayed the next
           time you visit the page.</p>`
        );
        $("#audio-form-submit").addClass("disabled");

        //store data so we can submit later
        store.set(`captureData-${location.pathname}`, captureData.getData());
      });
  });

}

/*
 * if data submit previously failed it is stored in Application 
 * local storage. If stored data is found try to submit the data
 * again.
 */
function retrySubmit() {
  let data = store.get(`captureData-${location.pathname}`);

  if (data) {
    //setting posted = true, prevents the warning message displayed when user exits the modal without
    //submitting data. The warning is not needed when data is being resubmited due to previous failure.
    posted = true;

    captureData.setData(data);
    //console.log("timing data: ", data);
    $("#captured-audio-data").html(JSON.stringify(data));

    let userInfo = getUserInfo();

    //if user logged in automatically fill in user info
    if (userInfo) {
      $("#captured-audio-name").val(userInfo.name);
      $("#captured-audio-email").val(userInfo.email);
    }
    $(uiTimeCaptureModal).modal("show");

    return true;
  }

  return false;
}

/*
  Timing data is stored in local storage while timing is in progress. When
  the page is initialized if partial data is found the timing session
  is restored to where it left off.
*/
function recoverPartialSession() {
  let data = store.get(`$captureData-${location.pathname}`);

  if (data) {
    store.remove(`$captureData-${location.pathname}`);

    //record time and park paragraph as timed
    for (let t in data.time) {
      autoCapture(data.time[t]);
    }

    let lastParagraph = data.time[data.time.length-1];
    //console.log("last paragraph: ", lastParagraph);

    //adjust audio play time to last timed paragraph
    audioPlayer.setCurrentTime(lastParagraph.seconds);

    notify.info("Partial audio capture data restored. You can continue timing where you left off.");

    //scroll last timed paragraph into viewport
    scroll(document.getElementById(lastParagraph.id));

    //indicate previous session was recovered
    return true;
  }

  return false;
}

/*
 * show or hide timing marker (bullseye) 
 */
function toggleMarkers() {
  let el = $(".transcript.ui.text.container");
  if (el.hasClass("hide-timing")) {
    //do we need to initialize edit of existing timing data
    //returns true if capture enabled
    initializeEdit()
      .then((response) => {
        if (response) {
          el.removeClass("hide-timing");
        }
      });
  }
  else {
    el.addClass("hide-timing");
  }
}

/*
  recover from failed timing data submit or incomplete timing session
  if present
*/
function restoreState() {
  //no failed submit found check for partial timing session
  //console.log("restoreState");
  if (!retrySubmit()) {

    //if no partial session was found, just mark first paragraph as selected
    if (!recoverPartialSession()) {
      if (!haveTimingData) {
        //create first data point but don't save in local store since user
        //has not initiated timing
        autoCapture({id: "p0", seconds: 0}, false);
      }
    }
  }
}

export default {

  /*
    The timingData parameter is optional and used when the user is a TIMER and we have
    timing data. In this case we load the timing data and allow the user to collect new
    times
  */
  initialize: function(player, timingData) {

    console.log("capture.init");

    //if we support time capture and we already have timing data, mark paragraphs
    //with a clock instead of the bullseye to indicate that we do have data
    if (timingData) {
      haveTimingData = true;
      markerIcon = "clock";
    }

    captureData = new CaptureData(location.pathname);
    captureData.setPlayer(player);

    //save a local reference to the audio player
    audioPlayer = player;

    //initially hide capture (bullseye) icon
    $(".transcript.ui.text.container").addClass("hide-timing");

    //add bullseye or clock icon to each class without class 'omit'
    $("p.cmiTranPara").each(function() {
      $(this).prepend(`<i class='timing large circular red ${markerIcon} outline icon'></i>`);
    });

    //create time capture listeners
    createListener();

    //if we don't have timing data call restoreState() otherwise
    //we receive timing data from setCaptureData() and call restoreState()
    //from there after loading the data
    if (!timingData) {
      //check for failed submit or partial timing session
      restoreState();
    }
    else {
      //notify user if there is a partial timing session
      if (store.get(`$captureData-${location.pathname}`)) {
        notify.info("You have an incomplete timing session. Start time capture to begin where you left off.");
      }
      else if (store.get(`captureData-${location.pathname}`)) {
        notify.info("You have a complete but unsubmited timing session. Please send us the data.");
        retrySubmit();
      }
    }
  },

  toggleMarkers: toggleMarkers,

  play: function() {
    audioPlaying = true;
  },

  pause: function() {
    audioPlaying = false;
  },

  /*
   * Audio playback ended. If times have been collected for all
   * paragraphs (the bullseye clicked) then display the time capture
   * modal dialog to send the data to Netlify
   */
  ended: function() {

    audioPlaying = false;

    //if data was not captured, return
    if (haveTimingData && !editInitialized) {
      return;
    }
    //if we don't have timingData and user, who is a TIMER, did not 
    //capture time there will be one value in the timing array
    else if (!haveTimingData && captureData.length() === 1) {
      captureProgress("REMOVE");
      return;
    }

    let newData = captureData.getData();

    //we have previously collected timing data and the user
    //has collected new data
    //- merge the new into the old and submit that
    if (editInitialized) {

      //merge newData into existing timing data if the two arrays are different lengths
      if (timingData.length !== newData.time.length) {
        //assume newData.length < timingData.length
        newData.time.forEach(o => {
          //get paragraph id and convert it into number to index the timingData array
          let idx = parseInt(o.id.substr(1),10);

          if (timingData[idx]) {
            timingData[idx].prevTime = timingData[idx].seconds;
            timingData[idx].seconds = o.seconds;
          }
          else {
            //don't expect this!!
            o.somethingFunny = true;
            timingData.push(o);
          }
        });

        //assign merged data
        newData.time = timingData;
      }
      else {
        //we just use the new data as is
      }
    }

    //timing complete - remove capture in-progress data
    captureProgress("REMOVE");

    let pCount = $("p.cmiTranPara").length;
    if (pCount !== newData.time.length) {
      //$("#captured-audio-comments").val(`Unexpected: pCount (${pCount}) !== newData.time.length (${newData.time.length})`);
      $("#captured-audio-comments").val(`Incomplete data, there is data for ${newData.time.length} of ${pCount} paragraphs`);
    }

    //add timing data to form
    $("#captured-audio-data").val(JSON.stringify(newData));
    let userInfo = getUserInfo();

    //if user logged in automatically fill in user info
    if (userInfo) {
      $("#captured-audio-name").val(userInfo.name);
      $("#captured-audio-email").val(userInfo.email);
      $(uiTimeCaptureModal).modal("show");
    }
    else {
      $(uiTimeCaptureModal).modal("show");
    }
  },

  //the audio player calls this every 250ms with the
  //current play time
  setCurrentPlaybackTime: function(t) {
    if (captureRequested) {
      markParagraph({
        id: captureId,
        seconds: t
      });
    }
  }
};
