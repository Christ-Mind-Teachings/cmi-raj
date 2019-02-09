import notify from "toastr";
import net, {getBookmark}  from "./bmnet";
import differenceWith from "lodash/differenceWith";
import cloneDeep from "lodash/cloneDeep";
import startCase from "lodash/startCase";
import { showBookmark } from "../_util/url";
import {initNavigator} from "./navigator";
import list from "./list";
//const topicsEndPoint = "https://s3.amazonaws.com/assets.christmind.info/wom/topics.json";
import topics from "./topics";
import { 
  markSelection, 
  getSelection, 
  deleteNewSelection, 
  deleteSelection, 
  initialize as selectInit,
  updateHighlightColor,
  updateSelectionTopicList
} from "./selection";

//add bookmark topics to bookmark selected text to support 
//selective display of hightlight based on topic
function addTopicsAsClasses(bookmark) {
  if (bookmark.topicList && bookmark.topicList.length > 0) {
    let topicList = bookmark.topicList.reduce((result, topic) => {
      if (typeof topic === "object") {
        return `${result} ${topic.value}`;
      }
      return `${result} ${topic}`;
    }, "");

    $(`[data-annotation-id="${bookmark.aid}"]`).addClass(topicList);
  }
}

/*
  Highlight all annotations with selected text
  ** except for paragraph of a shared annotation 0 sharePid
*/
function getPageBookmarks(sharePid) {
  //identify paragraphs with bookmarks
  net.getBookmarks()
    .then((response) => {
      if (response) {
        //mark each paragraph containing bookmarks
        for (let id in response) {
          let hasBookmark = false;
          let hasAnnotation = false;
          let pid = id - 1;
          let count = 0;

          for (const bm of response[id]) {
            if (bm.selectedText) {
              markSelection(bm.selectedText, count, sharePid);
              addTopicsAsClasses(bm);
              topics.add(bm);
              count++;
              hasBookmark = true;
            }
            else {
              $(`#p${pid} > span.pnum`).attr("data-aid", bm.creationDate);
              hasAnnotation = true;
            }
          }

          if (hasBookmark) {
            $(`#p${pid} > span.pnum`).addClass("has-bookmark");
          }

          if (hasAnnotation) {
            $(`#p${pid} > span.pnum`).addClass("has-annotation");
          }
        }
        topics.bookmarksLoaded();
      }
    })
    .catch((error) => {
      console.error(error);
      notify.error("Unable to load bookmarks");
    });
}

/*
  Clean up form values and prepare to send to API  
*/
function createAnnotaion(formValues) {
  console.log("createAnnotation");

  let annotation = cloneDeep(formValues);

  annotation.rangeStart = annotation.rangeStart.trim();
  annotation.rangeEnd = annotation.rangeEnd.trim();

  if (!annotation.rangeEnd.startsWith("p")) {
    annotation.rangeEnd = `p${annotation.rangeEnd}`;
  }

  //delete empty fields
  if (annotation.Comment === "") {
    delete annotation.Comment;
  }

  if (annotation.creationDate === "") {
    delete annotation.creationDate;
  }

  if (annotation.aid === "") {
    delete annotation.aid;
  }
  else {
    annotation.selectedText = getSelection(annotation.aid);

    if (annotation.creationDate) {
      annotation.selectedText.aid = annotation.creationDate.toString(10);
    }
    delete annotation.textId;
  }

  if (annotation.topicList.length === 0) {
    delete annotation.topicList;
  }

  //keep track of topics added or deleted
  updateSelectionTopicList(annotation);

  delete annotation.newTopics;
  delete annotation.hasAnnotation;

  //persist the bookmark
  net.postAnnotation(annotation);
}

/*
  new topics entered on the annotation form are formatted
  to keep only alpha chars and comma. Commas are used to delimit
  topics.

  Topics are converted from string to array and first character is
  uppercased.

  Multi word topics are supported. Each word is capitalized and the topic
  is formatted as an object like so:

    {value: "HolySpirit", topic: "Holy Spirit"}
*/
function formatNewTopics({newTopics}) {

  //only allow alpha chars and comma's and spaces
  let topics = newTopics.replace(/[^a-zA-Z0-9, ]/g, "");

  if (!topics || topics === "" ) {
    return [];
  }

  //remove leading and trailing comma's
  topics = topics.replace(/^,*/, "");
  topics = topics.replace(/,*$/, "");

  let newTopicArray = topics.split(",");
  newTopicArray = newTopicArray.map(t => t.trim());
  newTopicArray = newTopicArray.map(t => startCase(t));

  newTopicArray = newTopicArray.map(t => {
    if (/ /.test(t)) {
      return {value: t.replace(/ /g, ""), topic: t};
    }
    return t;
  });

  return newTopicArray;
}

/*
  Add new topics entered by user on annotation form to topic list
  and store locally and on the server
  - then create and submit new annotation
*/
function addToTopicList(newTopics, formValues) {
  //Check for new topics already in topic list
  net.fetchTopics()
    .then((response) => {
      //remove duplicate topics from and return the rest in difference[]
      let newUniqueTopics = differenceWith(newTopics, response.topics, (n,t) => {
        if (typeof t === "object") {
          return t.value === n;
        }
        return t === n;
      });

      //these are the new topics
      if (newUniqueTopics.length > 0) {
        //add new topics to topic list
        net.addToTopicList(newUniqueTopics);

        //add new topics to this annotations topicList
        formValues.topicList = formValues.topicList.concat(newUniqueTopics);

        //add newTopics to formValues for posting to server
        formValues.newTopics = newUniqueTopics;

        //post the bookmark
        createAnnotaion(formValues);
      }
    })
    .catch(() => {
      throw new Error("error in removing duplicate topics");
    });
} 

//toggle selected text highlights
function highlightHandler() {
  $(".toggle-bookmark-highlight").on("click", function(e) {
    e.preventDefault();
    let el = $(".transcript");

    if (el.hasClass("hide-bookmark-highlights")) {
      el.removeClass("hide-bookmark-highlights");
      $(".toggle-bookmark-highlight").text("Hide Highlighted Text");
    }
    else {
      el.addClass("hide-bookmark-highlights");
      $(".toggle-bookmark-highlight").text("Show Highlighted Text");
    }
  });
}

/*
  initialize transcript page
*/
function initTranscriptPage(sharePid) {

  //get existing bookmarks for page
  getPageBookmarks(sharePid);

  //add support for text selection
  selectInit();

  //show/hide bookmark highlights
  highlightHandler();

  //setup bookmark navigator if requested
  let pid = showBookmark();
  if (pid) {
    initNavigator(pid);
  }
}

export const annotation = {
  /*
    This is called when user submits data from annotation form.
    args:
      formData: annotation form data
  */
  submit(formData) {
    let newTopics = formatNewTopics(formData);

    //add new topics to topic list and create annotation
    if (newTopics.length > 0) {
      addToTopicList(newTopics, formData);
    }
    else {
      //post the bookmark
      createAnnotaion(formData);
    }

    //mark paragraph as having bookmark
    if (!formData.aid) {
      //bookmark has no selected text
      $(`#${formData.rangeStart} > span.pnum`).addClass("has-annotation");
    }
    else {
      $(`#${formData.rangeStart} > span.pnum`).addClass("has-bookmark");

      //this is a new annotation
      if (formData.creationDate === "") {
        let bookmarks = getBookmark(formData.rangeStart);

        let annotationCount = 0;
        if (bookmarks.bookmark && bookmarks.bookmark.length > 0) {
          annotationCount = bookmarks.bookmark.reduce((count, annotation) => {
            if (annotation.aid && annotation.aid !== formData.aid) {
              count = count + 1;
            }
            return count;
          }, 0);
        }
        updateHighlightColor(formData.aid, annotationCount);
      }
    }
  },

  //user pressed cancel on annotation form
  cancel(formData) {
    //no creationDate means a new annotation that hasn't been stored
    if (!formData.creationDate && formData.aid) {
      deleteNewSelection(formData.aid);
    }
  },

  //delete annotation
  delete(formData) {
    //if annotation has selected text unwrap and delete it
    if (formData.aid) {
      deleteSelection(formData.aid);
    }
    else {
      //remove mark from paragraph
      $(`#${formData.rangeStart} > span.pnum`).removeClass("has-annotation");
    }

    //mark as having no annotations if all have been deleted
    let remainingAnnotations = net.deleteAnnotation(formData.rangeStart, formData.creationDate);

    if (remainingAnnotations === 0) {
      $(`#${formData.rangeStart} > span.pnum`).removeClass("has-bookmark");
    } 

    //delete topics from the page topic list
    topics.delete(formData);
  }
};

/*
  if we're on a transcript page
  - add bookmark icons to each paragraph
  - create bookmark toggle listener
*/
export default {
  initialize: function(pid) {
    if ($(".transcript").length) {
      //this is a transcript page
      initTranscriptPage(pid);
    }

    //initialize bookmark list modal - available on all pages
    list.initialize();
  }
};
