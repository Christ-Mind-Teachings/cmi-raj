import scroll from "scroll-into-view";
import {getConfig} from "../_config/config";
import keyInfo from "../_config/key";

const uiTocModal = ".toc.ui.modal";
const uiOpenTocModal = ".toc-modal-open";
const uiModalOpacity = 0.5;


/*
  format links to Raj ACIM Sessions
*/
function renderRaj(links) {
  return `
    <div class="list raj-list hide">
      ${links.map(l => `<a class="item" href="${l.url}">${l.title}</a>`).join("")}
    </div>
  `;
}

/*
  generate html for acim text sections for Raj Cross Reference
*/
function renderRajSections(base, sections, cidx) {
  return `
    <div id="chapter${cidx + 1}" data-sections="${sections.length - 1}" class="list">
      ${sections.map((q, qidx) => `
        <div class="item">${q.ref?q.ref+" ":""}${q.title}</div>
        ${q.nwffacim ? renderRaj(q.nwffacim) : ""}
      `).join("")}
    </div>
  `;
}

//generate html for TOC for Raj Cross Reference
function makeRajContents(contents) {
  return (`
    <div class="ui relaxed list">
      ${contents.map((unit, cidx) => `
        <div class="item"> 
          <div class="header">Chapter ${unit.id}: ${unit.title}</div>
          ${unit.sections ? renderRajSections(unit.base, unit.sections, cidx) : "" } 
        </div>
      `).join("")}
    </div>
  `);
}

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

    Bid is needed in case next and previous are determined differently depending on book
*/
function highlightCurrentTranscript(bid, setNextPrev = true) {
  if ($(".transcript").length > 0) {
    let page = location.pathname;
    let $el = $(`.toc-list a[href='${page}']`);

    //remove href to deactivate link for current page and
    //scroll into middle of viewport
    $el.addClass("current-unit").removeAttr("href");
    scroll($el.get(0));

    if (!setNextPrev) {
      return;
    }

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

/*
  Loads TOC for current transcript page, marks current page in toc, and sets
  next/prev menu links

  On pages where the toc is created for items other than the menu toc the toc may need to be
  reset, this is done by checking for toc.init === true. To work correctly, page elements with
  .toc-modal-open must also have .combined, otherwise the toc will get messed up.
*/
function loadTOC(toc) {

  //check if previously initialized
  if (toc.init) {
    //toc refresh not needed if not combined
    if (!toc.combined) {
      return;
    }

    //console.log("toc previously initialized, toc: %o", toc);
    $(".toc-image").attr("src", `${toc.image}`);
    $(".toc-title").html(`Table of Contents: <em>${toc.title}</em>`);
    $(".toc-list").html(toc.html);

    //set current-item, don't setNextPrev since it was already done.
    highlightCurrentTranscript(toc.bid, false);

    return;
  }

  let book = $("#contents-modal-open").attr("data-book").toLowerCase();
  toc.book = book;

  getConfig(book)
    .then((contents) => {
      $(".toc-image").attr("src", `${contents.image}`);
      $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
      toc["image"] = contents.image;
      toc["title"] = contents.title;
      toc["bid"] = contents.bid;

      switch(contents.bid) {
        case "acim":
          toc.html = makeRajContents(contents.contents);
          break;
        default:
          toc.html = makeContents(contents.base, contents.contents);
          break;
      }

      toc.init = true;
      $(".toc-list").html(toc.html);
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
    let toc = {init: false, book: "", html: ""};

    //dialog settings
    $(uiTocModal).modal({
      dimmerSettings: {opacity: uiModalOpacity},
      observeChanges: true
    });

    //load toc once for transcript pages
    if (env === "transcript") {
      loadTOC(toc);
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
      let combined = $(e.currentTarget).hasClass("combined");

      //load the TOC if we're not on a transcript page
      if (env !== "transcript" || (env === "transcript" && combined)) {
        getConfig(book)
          .then((contents) => {
            $(".toc-image").attr("src", `${contents.image}`);
            $(".toc-title").html(`Table of Contents: <em>${contents.title}</em>`);
            //$(".toc-list").html(makeContents(contents.base, contents.contents));

            switch(contents.bid) {
              case "acim":
                $(".toc-list").html(makeRajContents(contents.contents));
                break;
              default:
                $(".toc-list").html(makeContents(contents.base, contents.contents));
                break;
            }

            //mark toc as combined
            if (env === "transcript" && combined) {
              toc["combined"] = true;
            }

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
        loadTOC(toc);
        $(uiTocModal).modal("show");
      }
    });
  }
};
