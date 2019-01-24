import scroll from "scroll-into-view";
import {getConfig} from "../_config/config";
import keyInfo from "../_config/key";

const uiTocModal = ".toc.ui.modal";
const uiOpenTocModal = ".toc-modal-open";
const uiModalOpacity = 0.5;

/*
  generate toc html for flat config file
*/
function makeContents(base, contents) {
  return (`
    <div class="ui relaxed ordered list">
      ${contents.map((content, pidx) => `
        <a data-lid="${pidx+1}" class="item" href="${base}${content.url}">${content.title}</a>`).join("")}
    </div>
  `);
}

/*
  set next/prev controls on menu for workbook transcripts
*/
function nextPrev(bid, $el) {
  var LAST_ID = keyInfo.getNumberOfUnits(bid);
  let prevId = -1, nextId = -1, href, text;
  let lid = $el.attr("data-lid");
  let lessonId = parseInt(lid, 10);

  //disable prev control
  if (lessonId === 1) {
    $("#previous-page-menu-item").addClass("disabled");
  }
  else {
    $("#previous-page-menu-item").removeClass("disabled");
    prevId = lessonId - 1;
  }

  //disable next control
  if (lessonId === LAST_ID) {
    $("#next-page-menu-item").addClass("disabled");
  }
  else {
    $("#next-page-menu-item").removeClass("disabled");
    nextId = lessonId + 1;
  }

  if (prevId > -1) {
    href = $(`a[data-lid="${prevId}"]`).attr("href");
    text = $(`a[data-lid="${prevId}"]`).text();

    //set prev tooltip and href
    $("#previous-page-menu-item > span").attr("data-tooltip", `${text}`);
    $("#previous-page-menu-item").attr("href", `${href}`);
  }

  if (nextId > -1) {
    href = $(`a[data-lid="${nextId}"]`).attr("href");
    text = $(`a[data-lid="${nextId}"]`).text();

    //set prev tooltip and href
    $("#next-page-menu-item > span").attr("data-tooltip", `${text}`);
    $("#next-page-menu-item").attr("href", `${href}`);
  }
}

/*
  If we're on a transcript page, highlight the 
  current transcript in the list and calc prev and next
  links

  Args:
    bid: bookId, 'text', 'workbook', 'manual'

    Bid is needed in case next and previous are determinded differently depending on book
*/
function highlightCurrentTranscript(bid) {
  if ($(".transcript").length > 0) {
    let page = location.pathname;
    let $el = $(`.toc-list a[href='${page}']`);

    //remove href to deactivate link for current page and
    //scroll into middle of viewport
    $el.addClass("current-unit").removeAttr("href");
    scroll($el.get(0));

    switch(bid) {
      case "vol":
      case "vol2":
        break;
      default:
        nextPrev(bid, $el);
        break;
    }
  }
}

//called for transcript pages
function loadTOC() {
  //console.log("transcript page: loading toc");
  let book = $("#contents-modal-open").attr("data-book").toLowerCase();

  getConfig(book)
    .then((contents) => {
      $(".toc-image").attr("src", `${contents.image}`);
      $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
      $(".toc-list").html(makeContents(contents.base, contents.contents));

      highlightCurrentTranscript(contents.bid);
    })
    .catch((error) => {
      console.error(error);
      $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
      $(".toc-title").html("Table of Contents: <em>Error</em>");
      $(".toc-list").html(`<p>Error: ${error.message}</p>`);
      $(uiTocModal).modal("show");
    });
}

/*
  Calls to this function are valid for transcript pages.
*/
export function getBookId() {
  return $(uiOpenTocModal).attr("data-book");
}

export default {

  /*
   * Init the modal dialog with data from JSON file 
   * or local storage
   */
  initialize: function(env) {
    //dialog settings
    $(uiTocModal).modal({
      dimmerSettings: {opacity: uiModalOpacity},
      observeChanges: true
    });

    //load toc once for transcript pages
    if (env === "transcript") {
      loadTOC();
    }

    /*
     * TOC populated by JSON file from AJAX call if not found
     * in local storage.
     * 
     * Read value of data-book attribute to identify name of file
     * with contents.
     */
    $(uiOpenTocModal).on("click", (e) => {
      e.preventDefault();
      let book = $(e.currentTarget).attr("data-book").toLowerCase();

      //load the TOC if we're not on a transcript page
      if (env !== "transcript") {
        getConfig(book)
          .then((contents) => {
            $(".toc-image").attr("src", `${contents.image}`);
            $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
            $(".toc-list").html(makeContents(contents.base, contents.contents));

            $(uiTocModal).modal("show");
          })
          .catch((error) => {
            console.error(error);
            $(".toc-image").attr("src", "/public/img/cmi/toc_modal.png");
            $(".toc-title").html("Table of Contents: <em>Error</em>");
            $(".toc-list").html(`<p>Error: ${error.message}</p>`);
            $(uiTocModal).modal("show");
          });
      }
      else {
        $(uiTocModal).modal("show");
      }
    });
  }
};
