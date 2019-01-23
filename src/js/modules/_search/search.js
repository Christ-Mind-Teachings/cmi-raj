
const searchEndpoint = "https://d9lsdwxpfg.execute-api.us-east-1.amazonaws.com/latest/wom";
import axios from "axios";
import { showSavedQuery, showSearchResults } from "./show";
import {showSearchMatch} from "../_util/url"; 
import { initNavigator } from "./navigator";
import notify from "toastr";

//search modal
const uiSearchModal = ".search.ui.modal";
const uiOpenSearchModal = ".search-modal-open";
const uiSearchForm = "#search";
const uiSearchSource = "#search .source";
const uiSearchString = "#search input";
const uiSearchInputIcon = "#search .ui.icon.input";
const uiModalOpacity = 0.5;

//search modal message box
const uiSearchMessage = ".ui.search.message";
const uiSearchMessageHeader = ".search-message.header";
const uiSearchMessageBody = ".search-message-body";

//search message id's
const SOURCE_NOT_SELECTED = Symbol("no_source");
const SOURCE_SELECTED = Symbol("source_selected");
const SEARCHING = Symbol("searching");
const SEARCH_RESULT = Symbol("search_result");
const SEARCH_ERROR = Symbol("search_error");
const SAVED_SEARCH = Symbol("saved_search");

function displaySearchMessage(msgId, arg1, arg2, arg3) {
  switch(msgId) {
    case SOURCE_NOT_SELECTED:
      $(uiSearchMessage).addClass("negative");
      $(uiSearchMessageHeader).text("Search Source Not Selected");
      $(uiSearchMessageBody).html("<p>You forgot to select a search source.</p>");
      break;
    case SOURCE_SELECTED:
      $(uiSearchMessage).removeClass("negative");
      $(uiSearchMessageHeader).text("Search Source");
      $(uiSearchMessageBody).html(`<p>Searching from <em>${arg1}</em></p>`);
      break;
    case SEARCHING:
      $(uiSearchInputIcon).addClass("loading");
      $(uiSearchString).attr("disabled", true);
      $(uiSearchMessage).addClass("purple");
      $(uiSearchMessageHeader).text("Search Started...");
      $(uiSearchMessageBody).html(`<p>Searching for <em>${arg2}</em></p>`);
      break;
    case SAVED_SEARCH:
      //arg1: source, arg2: query string, arg3: count
      $(uiSearchMessageHeader).text("Last Search Result");
      $(uiSearchMessageBody).html(`<p>Search for <em>${arg2}</em> from <em>${arg1}</em> found ${arg3} matches</p>`);
      break;
    case SEARCH_RESULT:
      $(uiSearchInputIcon).removeClass("loading");
      $(uiSearchString).attr("disabled", false);
      $(uiSearchMessage).removeClass("purple").removeClass("negative");

      //clear input only if matches were found
      if (arg3 > 0) {
        $(uiSearchString).val("");
      }

      $(uiSearchMessageHeader).text("Search Result");
      $(uiSearchMessageBody).html(`<p>Search for <em>${arg2}</em> found ${arg3} matches</p>`);
      break;
    case SEARCH_ERROR:
      $(uiSearchInputIcon).removeClass("loading");
      $(uiSearchString).attr("disabled", false);
      $(uiSearchMessage).removeClass("purple").addClass("negative");

      $(uiSearchMessageHeader).text("Search Error");
      $(uiSearchMessageBody).html(`<p>${arg1}</p>`);
      break;
    default:
      break;
  }
}

//run query
function search(query) {
  let searchBody = {
    query: query,
    width: 30
  };

  axios.post(searchEndpoint, searchBody)
    .then((response) => {
      displaySearchMessage(SEARCH_RESULT, "", query, response.data.count);
      if (response.data.count > 0) {
        showSearchResults(response.data, searchBody.query);
      }
      else {
        notify.info(`Search for ${query} didn't find any matches`);
      }
      document.getElementById("search-input-field").focus();
    })
    .catch((error) => {
      console.error("search error: %o", error);
      displaySearchMessage(SEARCH_ERROR, error.message);
    });
}

function initTranscriptPage() {
  let displayPid = showSearchMatch();
  if (displayPid) {
    initNavigator(displayPid);
  }
}

/*
  Initialize support for search modal window available
  on all pages
*/
function initSearchModal() {

  $(uiSearchModal).modal({
    dimmerSettings: {opacity: uiModalOpacity},
    observeChanges: true,
    onShow: function() {
      //load modal with prior query results

      //check if modal already has query results loaded
      if ($(".cmi-search-list > h3").length === 0) {
        showSavedQuery();
      }
    }
  });

  $(uiOpenSearchModal).on("click", (e) => {
    e.preventDefault();
    $(uiSearchModal).modal("show");
  });

  //Search Submit
  $(uiSearchForm).submit(function(e) {
    e.preventDefault();
    var searchSource = $(uiSearchSource).text();
    var searchString = $(uiSearchString).val();

    //ignore and return if search string is empty
    if (searchString.length === 0) {
      return;
    }

    //console.log("Search requested: source: %s, string: %s", searchSource, searchString);
    displaySearchMessage(SEARCHING, searchSource, searchString);

    //run search
    search(searchString);
  });

}

export default {
  initialize: function() {

    if ($(".transcript").length) {
      //this is a transcript page
      initTranscriptPage();
    }

    initSearchModal();
  }
};

