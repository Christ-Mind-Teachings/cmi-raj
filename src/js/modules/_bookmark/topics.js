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
let listRefreshNeeded = true;
let deletedKeys = [];

const uiPageTopicsModal = "#page-topics-modal";
const uiOpenPageTopicsModal = "#page-topics-modal-open";
const uiModalOpacity = 0.5;

//generate the option element of a select statement
function generateOption(topic) {
  if (typeof topic === "object") {
    return `<option value="${topic.value}">${topic.topic}</option>`;
  }
  return `<option value="${topic}">${topic}</option>`;
}

//generate select html for Topics
function makeTopicSelect(topics) {
  return (`
    <select name="pageTopicList" id="page-topics-topic-list" class="search ui dropdown">
      ${topics.map(topic => `${generateOption(topic)}`).join("")}
    </select>
  `);
}

function formatTopic(topic) {
  if (topic === "__reset__") {
    return "<div class='reset-filter item'>Clear Filter</div>";
  }
  return `<div class="item">${topic}</div>`;
}

function makeTopicSelectElement() {
  let topicMap = getTopics();
  let topicKeys = Array.from(topicMap.keys());
  let topics = topicKeys.map(key => {
    return topicMap.get(key);
  });

  topics.sort((a,b) => {
    if (a.value < b.value) {
      return -1;
    }
    if (a.value > b.value) {
      return 1;
    }
    return 0;
  });

  return makeTopicSelect(topics);
}

function getTopics() {
  return topics;
}

/*
  Generate html for page topic list and reset listRefreshNeeded indicator
*/
function makeTopicList(topicMap) {
  let topicKeys = Array.from(topicMap.keys());
  let topics = topicKeys.map(key => {
    let t = topicMap.get(key);
    return t.topic;
  });

  listRefreshNeeded = false;

  if (topics.length === 0) {
    return "<div class='ntf item'>Page has no topics</div>";
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

    //check for multi-word topic and remove spaces
    if (/ /.test(topic)) {
      topic = topic.replace(/ /g, "");
    }

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
  /*
  if (listRefreshNeeded) {
    let html = makeTopicList(topics);
    $("#topic-menu-select").html(html);
  }
  */

  //check if there is a topic filter on a deleted key, if so, clear
  //the filter
  if (deletedKeys.length > 0) {
    let activeFilter = $("#topic-menu-item").prev(".header").attr("data-filter");

    //no active filter
    if (activeFilter === "none") {
      return;
    }
    let found = deletedKeys.reduce((fnd, item) => {
      if (item.topic === activeFilter) {
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

/*
  Keep track of topics on the page. If we have a un-tracked topic add it
  to 'topic' and set count to 1. If the topic is already tracked just 
  increment the count

  All topics look like this: {value: "nospaces", topic: "might have spaces"}
*/
function increment(newTopic) {
  let key = newTopic.value;

  //if newTopic is not in topics, add it and set count to 1
  if (!topics.has(key)) {
    newTopic.count = 1;
    topics.set(key, newTopic);
    listRefreshNeeded = true;
  }
  else {
    //otherwise increment the count
    let savedTopic = topics.get(key);
    savedTopic.count += 1;
    topics.set(key, savedTopic);
  }
}

/*
  Decrement count for tracked topic
*/
function decrement(trackedTopic) {
  let key = trackedTopic;

  if (typeof key === "object") {
    key = key.value;
  }

  if (!topics.has(key)) {
    throw new Error(`Unexpected error: topic ${key} not found in topic Map`);
  }
  else {
    let trackedTopicValue = topics.get(key);

    //no more bookmarks on page with this topic
    if (trackedTopicValue.count === 1) {
      topics.delete(key);
      listRefreshNeeded = true;
      deletedKeys.push(trackedTopicValue);
    }
    else {
      //decrement count and store value
      trackedTopicValue.count -= 1;
      topics.set(key, trackedTopicValue);
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
    initPageTopicsModal();

    /*
    let html = makeTopicList(topics);
    $("#topic-menu-select").html(html);

    //init click handler
    topicSelectHandler();
    */
  },

  //given a topic value return the topic.topic
  getTopic(value) {
    let t = topics.get(value);

    if (t) {
      return t.topic;
    }

    return null;
  },

  report() {
    for (var [key, value] of topics) {
      console.log("%s: %s", key, value);
    }
  }
};

/*
  Get topic select element for page-topic-modal
*/  
function getTopicList() {
  if (!listRefreshNeeded) return;
  let selectHtml = makeTopicSelectElement();

  $("#page-topics-modal-topic-select").html(selectHtml);
  $("#page-topics-topic-list").dropdown();

  $("#page-topics-modal-loading").removeClass("active").addClass("disabled");
  listRefreshNeeded = false;
}

function initPageTopicsModal() {
  $(uiPageTopicsModal)
    .modal({
      dimmerSettings: {opacity: uiModalOpacity},
      autofocus: false,
      centered: true,
      duration: 400,
      inverted: true,
      observeChanges: true,
      transition: "horizontal flip",
      onShow: function() {
        getTopicList();
      },
      onVisible: function() {
      },
      onHidden: function() {
      }
    });

  $(uiOpenPageTopicsModal).on("click", (e) => {
    e.preventDefault();

    //populateBookmarkModal(uiBookmarkModalDiv);
    $(uiPageTopicsModal).modal("show");
  });

  filterSubmitHandler();
  filterResetHandler();
}

/*
  Apply topic filter to bookmarks on page
*/
function filterSubmitHandler() {
  //apply topic filter
  $("#page-topics-filter-submit").on("click", function(e) {
    e.preventDefault();
    let form = $("#page-topics-filter-form");
    let filterTopic = form.form("get value", "pageTopicList");

    let topicTopic = $(`#page-topics-topic-list > [value='${filterTopic}']`).text();
    setTopicFilter({value: filterTopic, topic: topicTopic});

    /*
    let bookmarkItems = $(".cmi-bookmark-list .bookmark-item");
    bookmarkItems.each(function() {
      let classList = $(this).attr("class");
      if (classList.match(topicRegExp)) {
        //the bookmark could be hidden from a previous filter, so just remove the class
        //in case it's there
        $(this).removeClass("hide-bookmark-item");
      }
      else {
        $(this).addClass("hide-bookmark-item");
      }
    });

    //keep track of the state of the bookmark Modal
    let bookmarkModalInfo = bookmarkModalState("get");

    //if we have data we're initializing and so we don't need to save state
    if (!data) {
      bookmarkModalInfo["modal"].filter = true;
      bookmarkModalInfo["modal"].topics = topics;
      bookmarkModalState("set", bookmarkModalInfo);
    }

    $("[data-bid]").each(function() {
      let bid = $(this).data("bid");
      let filtered = $(`[data-bid="${bid}"] .bookmark-item.hide-bookmark-item`).length;
      let remaining = bookmarkModalInfo[bid].count - filtered;

      //update title to reflect number of bookmarks shown after filter applied
      $(`.${bid}-header`).html(`${bookmarkModalInfo[bid].header} (<span class="bookmark-filter-color">${remaining}</span>/${bookmarkModalInfo[bid].count})`);
    });
    */
  });
}

/*
  Clear bookmark filter
*/
function filterResetHandler() {
  //clear filter
  $(".page-topics-filter-reset").on("click", function(e) {
    e.preventDefault();

    //mark transcript as having an active filter
    if ($(".transcript").hasClass("topic-filter-active")) {
      //clear active filter
      let currentFilter = $("#current-topic-filter").attr("data-filter");

      $(`mark.bookmark-selected-text.${currentFilter}`).removeClass("show");
    }

    $(".transcript").removeClass("topic-filter-active");

    //clear active filter from menu
    $("#current-topic-filter").html("Topic Filter: None");
    $("#current-topic-filter").attr("data-filter", "");

    //mark bookmark icon green - no filter applied
    $("#bookmark-dropdown-menu > span > i").eq(0).removeClass("yellow").addClass("green");

    //close the modal
    //$(uiPageTopicsModal).modal("hide");
  });
}

/*
  Show selected text from bookmarks that contain topic. If there is an active filter
  already clear it first.

  Args: topic; show only bookmarks with this topic
*/
function setTopicFilter(topic) {
  //mark transcript as having an active filter
  if ($(".transcript").hasClass("topic-filter-active")) {
    //clear active filter
    let currentFilter = $("#current-topic-filter").attr("data-filter");

    //new filter is the same as the current, no need to do anything
    if (currentFilter === topic.value) {
      return;
    }

    $(`mark.bookmark-selected-text.${currentFilter}`).removeClass("show");
  }
  else {
    $(".transcript").addClass("topic-filter-active");
  }

  $(`mark.bookmark-selected-text.${topic.value}`).addClass("show");

  //mark menu option as having an active filter
  $("#current-topic-filter").html(`Topic Filter: <span class="red">${topic.topic}</span>`);
  $("#current-topic-filter").attr("data-filter", topic.value);

  //mark bookmark icon as yellow - filter is applied
  $("#bookmark-dropdown-menu > span > i").eq(0).removeClass("green").addClass("yellow");

  //close the modal
  $(uiPageTopicsModal).modal("hide");
}
