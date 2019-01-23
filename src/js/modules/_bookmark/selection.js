import notify from "toastr";

const textPosition = require("dom-anchor-text-position");
const textQuote = require("dom-anchor-text-quote");
const wrapRange = require("wrap-range-text");
const uuid = require("uuid/v4");

import {getUserInput, initialize as initAnnotation} from "./annotate";
import isFinite from "lodash/isFinite";
import difference from "lodash/difference";

import topics from "./topics";

//all annotations on the page
let pageAnnotations = {};

//all annotations that were not highlighted due to shared annotation conflict
let skippedAnnotations = [];

export function highlightSkippedAnnotations() {
  let sequence = 0;

  if (skippedAnnotations.length === 0) {
    return;
  }

  let node;

  for (let a of skippedAnnotations) {
    let annotation = pageAnnotations[a];
    console.log("annotation: %o", annotation);

    //all skiped annotations are on the same pid, so get id just once
    if (!node) {
      node = document.getElementById(annotation.pid);
    }

    highlight(annotation, node);
    updateHighlightColor(annotation.id, sequence);
    sequence += 1;
  }
}

/*
  add or update selected text class list with topics
*/
export function updateSelectionTopicList(annotation) {
  let topicList;

  //annotation has no selected text
  if (!annotation.aid) {
    return;
  }

  //if annotation.topicList exists convert it to a string
  if (annotation.topicList && annotation.topicList.length > 0) {
    topicList = annotation.topicList.reduce((result, topic) => {
      if (typeof topic == "object") {
        return `${result} ${topic.value}`;
      }
      return `${result} ${topic}`;
    }, "");
  }

  let topicListArray = [];
  if (topicList) {
    topicList = topicList.trim();
    topicListArray = topicList.split(" ");
  }

  //get existing classes and convert to an array
  let existingClasses = $(`[data-annotation-id="${annotation.aid}"]`).attr("class");
  let classArray = existingClasses.split(" ");

  //remove bookmmark-selected-text
  let bstIndex = classArray.findIndex((item) => item === "bookmark-selected-text");
  if (bstIndex > -1) {
    classArray.splice(bstIndex, 1);
  }

  //remove colorClass
  let ccIndex = classArray.findIndex((item) => item.startsWith("colorClass"));
  if (ccIndex > -1) {
    classArray.splice(ccIndex, 1);
  }

  //classes have been added or deleted
  let deletedTopics = difference(classArray, topicListArray);
  let addedTopics = difference(topicListArray, classArray);
  //console.log("deletedTopics: %o", deletedTopics);
  //console.log("addedTopics: %o", addedTopics);

  //remove deleted topics
  if (deletedTopics.length > 0) {
    let dt = deletedTopics.join(" ");
    $(`[data-annotation-id="${annotation.aid}"]`).removeClass(dt);

    //track page topics
    topics.deleteTopics(deletedTopics);
  }

  //add added topics
  if (addedTopics.length > 0) {
    let at = addedTopics.join(" ");
    $(`[data-annotation-id="${annotation.aid}"]`).addClass(at);

    //track page topics
    topics.addTopics(addedTopics);
  }

  //topics.report();
}

/*
  if the annotation is new then remove the highlight and
  delete from pageAnnotations
*/
export function deleteNewSelection(id) {
  //no id when annotation has no associated text
  if (!id) {
    return;
  }

  let highlite = pageAnnotations[id];

  //new highlite is not associated with a bookmark annotation so it doesn't have an 'aid' attribute
  if (highlite.aid) {
    return;
  }

  //remove highlight
  highlite.wrap.unwrap();

  //delete the annotation
  delete pageAnnotations[id];
}

/*
  unwrap selected text and delete
*/
export function deleteSelection(id) {
  if (!id) {
    return;
  }

  let highlite = pageAnnotations[id];

  if (!highlite) {
    return;
  }

  //remove highlight
  highlite.wrap.unwrap();

  //delete the annotation
  delete pageAnnotations[id];
}

export function getSelection(id) {
  return pageAnnotations[id];
}

export function updateHighlightColor(id, sequence) {
  let colorClasses = [
    "colorClass1", 
    "colorClass2", 
    "colorClass3", 
    "colorClass4", 
    "colorClass5", 
    "colorClass6"
  ];
  $(`[data-annotation-id="${id}"]`).addClass(colorClasses[sequence % 6]);
}

/*
  Highlight selected text
  args:
    annotation: a bookmark annotation with selected text
    sequence: the sequence of this annotation within the paragraph
    sharePid: the pid of a shared bookmark, null otherwise. The pid is highlighted after
              the sharedPid is closed
*/
export function markSelection(annotation, sequence = 0, sharePid = null) {
  let node = document.getElementById(annotation.pid);

  if (!sharePid || sharePid !== annotation.pid) {
    highlight(annotation, node);
    updateHighlightColor(annotation.id, sequence);
  }
  else if (sharePid) {
    console.log("highlight of %s skipped due to share", sharePid);
    skippedAnnotations.push(annotation.id);
  }
  pageAnnotations[annotation.id] = annotation;
}

export function updateSelectedText(id, aid) {
  $(`[data-annotation-id="${id}"]`).attr("data-aid", aid);
}

export function highlight(annotation, toNode = document.body) {
  var anno_id = annotation.id;

  if (annotation.target.source) {
    var selectors = annotation.target.selector;
    for (var i = 0 ; i < selectors.length ; i++) {
      var selector = selectors[i];
      var type = selector.type;
      switch (type) {
        case "TextPositionSelector":
          // skip existing marks
          var existing_marks = document.querySelectorAll(`[data-annotation-id="${anno_id}"]`);
          if (existing_marks.length === 0) {
            var mark = document.createElement("mark");
            mark.dataset["annotationId"] = anno_id;

            //the id of the bookmark annotation that contains this annotation
            if (annotation.aid) {
              mark.dataset["aid"] = annotation.aid;
            }
            mark.classList.add("bookmark-selected-text");

            //this sometimes fails and is fixed by adjusting the selector
            var range;
            try {
              range = textPosition.toRange(toNode, selector);
              annotation.wrap = wrapRange(mark, range);
            }
            catch(err) {
              console.log("adjusting selector.end");
              selector.end--;
              range = textPosition.toRange(toNode, selector);
              annotation.wrap = wrapRange(mark, range);
            }
          }
          break;
      }
    }
  }
}

function getSelectedText(range, fromNode = document.body) {
  if (range.collapsed) return null;

  var textPositionSelector = textPosition.fromRange(fromNode, range);
  Object.assign(textPositionSelector, {type: "TextPositionSelector"});

  var textQuoteSelector = textQuote.fromRange(fromNode, range);
  Object.assign(textQuoteSelector, {type: "TextQuoteSelector"});

  var selectedText = {
    type: "Annotation",
    url: location.pathname,
    pid: range.startContainer.parentNode.id,
    id: uuid(),
    target: {
      type: "SpecificResource",
      source: location.href,
      selector: [
        textPositionSelector,
        textQuoteSelector,
      ]
    }
  };

  return selectedText;
}

/*
  Capture user text selection
*/
export function initialize() {
  $("div.transcript.ui").on("mouseup", function(e) {
    e.preventDefault();

    if (document.getSelection().isCollapsed) {
      return;
    }

    let selObj = document.getSelection(); 
    console.log("selection: %o", selObj);

    //Safari calls this function twice for each selection, the second time
    //rangeCount === 0 and type == "None"
    if (selObj.rangeCount === 0) {
      console.log("selObj.rangeCount === 0)");
      return;
    }

    if (selObj.getRangeAt(0).collapsed) {
      console.log("range collapsed");
      return;
    }

    let range = selObj.getRangeAt(0);
    processSelection(range);
  });

  //init annotation input, edit, and delete
  initAnnotation();
}

/*
  create annotation from selected text
*/
function processSelection(range) {
  console.log("range: %o", range);

  //check for overlap with other highlighted text
  let startParent = range.startContainer.parentElement.localName;
  let endParent = range.endContainer.parentElement.localName;

  if (startParent === "span") {
    notify.info("Don't include the paragraph number in your selection, please try again.");
    console.log("selection includes <p>");
    return;
  }

  if (startParent === "mark" || endParent === "mark") {
    notify.info("Your selection is overlapping with another; overlapping is not supported.");
    console.log("overlapping selections");

    if (location.hostname === "localhost") {
      debugger;
    }

    return;
  }

  let rangeStart = range.startContainer.parentElement.id;
  //let rangeStart = range.commonAncestorContainer.id;
  let rangeEnd = range.endContainer.parentElement.id;

  //the range must start with a transcript paragraph, one whose id = "p<number>" or an <em> found
  //within a paragraph
  if (!rangeStart) {
    console.log("selection parent element: %s", range.startContainer.parentElement.nodeName);
    return;
  }

  if (!rangeStart.startsWith("p")) {
    console.log("range does not start with <p>");
    return;
  }

  let pid = parseInt(rangeStart.substr(1), 10);
  if (!isFinite(pid)) {
    console.log("Pid: %s !isFinite()");
    return;
  }

  //not sure how to handl text selected across paragraphs, so disallow it.
  if (rangeStart !== rangeEnd) {
    notify.info("Please limit selected text to a single paragraph");
    console.log("multi paragraph selection: start: %s, end: %s", rangeStart, rangeEnd);
    return;
  }

  let node = document.getElementById(rangeStart);

  //create annotation
  let selectedText = getSelectedText(range, node);
  if (selectedText) {
    highlight(selectedText, node);

    //persist annotation
    pageAnnotations[selectedText.id] = selectedText;
    getUserInput(selectedText);
  }
}
