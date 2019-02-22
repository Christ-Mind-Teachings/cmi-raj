import {pageDriver, pageNavigationDriver, transcriptDriver} from "../_util/driver";

function createClickHandlers() {
  //help menu
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
      location.href = "https://www.christmind.info/acq/quick/";
    }

    if ($(this).hasClass("view-documentation")) {
      console.log("video documentation not ready yet");
      //location.href = "";
    }

    if ($(this).hasClass("profile-management")) {
      if (location.hostname === "localhost") {
        location.href = "http://localhost:9999/profile/email/";
      }
      else {
        location.href = "https://www.christmind.info/profile/email/";
      }
    }
  });

  //quick links
  $("#quick-links").on("click", "div.item", function(e) {
    e.preventDefault();

    let href = $(this).attr("data-href");
    //console.log("quick links href: %s", href);
    location.href = href;
  });
}

export default {
  initialize() {
    createClickHandlers();
  }
};
