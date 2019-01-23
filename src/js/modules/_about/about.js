import {pageDriver, pageNavigationDriver, transcriptDriver} from "../_util/driver";

function createClickHandlers() {
  $("#help-menu").on("click", "div.item", function(e) {
    e.preventDefault();

    if ($(this).hasClass("page-tour")) {
      console.log("pageDriver");
      pageDriver();
    }

    if ($(this).hasClass("page-navtour")) {
      console.log("page Nav Driver");
      pageNavigationDriver();
    }

    if ($(this).hasClass("transcript-tour")) {
      console.log("transcriptDriver");
      transcriptDriver();
    }

    if ($(this).hasClass("about-src")) {
      location.href = "/about/";
    }

    if ($(this).hasClass("read-documentation")) {
      location.href = "https://docs.christmind.info";
    }

    if ($(this).hasClass("view-documentation")) {
      console.log("video documentation not ready yet");
      //location.href = "";
    }
  });
}

export default {
  initialize() {
    createClickHandlers();
  }
};
