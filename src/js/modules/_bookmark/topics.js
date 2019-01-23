/*
  Keeps track of topics used by page annotations that have selectedText

  The list of topics is added to the bookmark menu option on transcript pages
  and allows the user to show only highlighted text of the selected topic.

  When the user selects a topic, the class .topic-filter-active is added to .transcript
  and the class .show is added to each highlight containing the selected topic. This works
  because each highlight contains a class that corresponds to each topic the annotation 
  contains.
*/

let topics = new Map();
let listRefreshNeeded;
let deletedKeys = [];

function formatTopic(topic) {
  if (topic === "__reset__") {
    return "<div class='reset-filter item'>Clear Filter</div>";
  }
  return `<div class="item">${topic}</div>`;
}

/*
  Generate html for page topic list and reset listRefreshNeeded indicator
*/
function makeTopicList(topicMap) {
  let topics = Array.from(topicMap.keys());
  listRefreshNeeded = false;

  if (topics.length === 0) {
    return "<div class='ntf item'>No Topics Found</div>";
  }
  topics.sort();
  topics.unshift("__reset__");

  return `
    ${topics.map(topic => `${formatTopic(topic)}`).join("")}
  `;
}

//topic selection click handler
function topicSelectHandler() {
  $("#topic-menu-item").on("click", "#topic-menu-select > .item", function(e) {
    e.preventDefault();

    //class .ntf indicates there are no topics, so just return
    if ($(this).hasClass("ntf")) {
      return;
    }

    let active;

    //clear the topic filter
    if ($(this).hasClass("reset-filter")) {
      active = $("#topic-menu-select > .active.item");

      //check for unexpected condition
      if (active.length === 0) {
        return;
      }
      let activeTopic = active.text();

      if (activeTopic === "Clear Filter") {
        //there is not active filter so return
        return;
      }

      active.removeClass("active");

      //remove .show from previously selected highlights
      $(`mark.bookmark-selected-text.${activeTopic}`).removeClass("show");

      //remove filter indication from .transcript
      $(".transcript").removeClass("topic-filter-active");

      //reset header text
      $("#topic-menu-item").prev(".header").text("Topic Filter: None");
      $("#topic-menu-item").prev(".header").attr("data-filter", "none");

      return;
    }

    //filter already active
    if ($(this).hasClass("active")) {
      return;
    } 

    //look for already active filter and remove it
    active = $("#topic-menu-select > .active.item");
    if (active.length > 0) {
      let activeTopic = active.text();
      active.removeClass("active");

      //remove .show from previously selected highlights
      $(`mark.bookmark-selected-text.${activeTopic}`).removeClass("show");
    }

    //mark topic as active
    $(this).addClass("active");

    //mark transcript as having an active filter
    $(".transcript").addClass("topic-filter-active");

    //add class .show to each highlight containing the selected topic
    let topic = $(this).text();
    $(`mark.bookmark-selected-text.${topic}`).addClass("show");

    //mark menu option as having an active filter
    $("#topic-menu-item").prev(".header").html(`Topic Filter: <span class="red">${topic}</span>`);
    $("#topic-menu-item").prev(".header").attr("data-filter", topic);
  });
}

/*
  If topics have been added or deleted from the topic list then
  the dropdown menu option needs to be updated
*/
function updateTopicList() {
  if (listRefreshNeeded) {
    let html = makeTopicList(topics);
    $("#topic-menu-select").html(html);
  }

  //check if there is a topic filter on a deleted key, if so, clear
  //the filter
  if (deletedKeys.length > 0) {
    let activeFilter = $("#topic-menu-item").prev(".header").attr("data-filter");

    //no active filter
    if (activeFilter === "none") {
      return;
    }
    let found = deletedKeys.reduce((fnd, item) => {
      if (item === activeFilter) {
        return fnd + 1;
      }
      return fnd;
    }, 0);

    //reset the filter
    if (found > 0) {
      //console.log("active filter topic has been deleted: %o", deletedKeys);

      //remove filter indication from .transcript
      $(".transcript").removeClass("topic-filter-active");

      //reset header text to indicate filter has cleared
      $("#topic-menu-item").prev(".header").text("Topic Filter: None");
      $("#topic-menu-item").prev(".header").attr("data-filter", "none");
    }

  }
}

function increment(key) {
  if (!topics.has(key)) {
    topics.set(key, 1);
    listRefreshNeeded = true;
  }
  else {
    let count = topics.get(key);
    topics.set(key, count + 1);
  }
}

function decrement(key) {
  if (!topics.has(key)) {
    throw new Error("Unexpected error: topic %s not found in topic Map", key);
  }
  else {
    let count = topics.get(key);
    if (count === 1) {
      topics.delete(key);
      listRefreshNeeded = true;
      deletedKeys.push(key);
    }
    else {
      topics.set(key, count - 1);
    }
  }
}

export default {
  //add topics from an annotation - this happens when bookmarks are loaded
  //and before the topicList is rendered
  add(annotation) {
    if (!annotation.selectedText) {
      return;
    }
    if (annotation.topicList && annotation.topicList.length > 0) {
      annotation.topicList.forEach((topic) => {
        increment(topic);
      });
    }
  },

  delete(formData) {
    if (!formData.topicList) {
      return;
    }
    if (formData.topicList && formData.topicList.length > 0) {
      formData.topicList.forEach((topic) => {
        decrement(topic);
      });

      updateTopicList();
    }
  },
  addTopics(topicArray) {
    //console.log("addTopics()");
    topicArray.forEach((topic) => {
      increment(topic);
    });
    updateTopicList();
  },
  deleteTopics(topicArray) {
    topicArray.forEach((topic) => {
      decrement(topic);
    });
    updateTopicList();
  },

  //generate topic select list and setup listeners
  bookmarksLoaded() {
    let html = makeTopicList(topics);
    $("#topic-menu-select").html(html);

    //init click handler
    topicSelectHandler();
  },

  report() {
    for (var [key, value] of topics) {
      console.log("%s: %s", key, value);
    }
  }
};
