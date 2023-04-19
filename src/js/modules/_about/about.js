import {transcriptDriver, pageNavigationDriver} from "common/modules/_util/driver";
import clipboard from "common/modules/_bookmark/clipboard";

import key from "../_config/key";
import {pageDriver} from "../_util/driver";

function createClickHandlers() {
  //help menu
  $("#help-menu").on("click", "div.item", function(e) {
    e.preventDefault();

    if ($(this).hasClass("page-tour")) {
      pageDriver();
    }

    if ($(this).hasClass("page-navtour")) {
      //console.log("page Nav Driver");
      pageNavigationDriver("The Raj Materail");
    }

    if ($(this).hasClass("transcript-tour")) {
      //console.log("transcriptDriver");
      transcriptDriver("The Raj Material");
    }

    if ($(this).hasClass("about-src")) {
      location.href = "/about/";
    }

    if ($(this).hasClass("read-documentation")) {
      location.href = "/acq/quick/";
    }

    if ($(this).hasClass("view-documentation")) {
      location.href = "/acq/video/";
    }

    if ($(this).hasClass("contact-me")) {
      location.href = "/acq/contact/";
    }
  });

  $(".login-menu-option-account").on("click", "div.item", function(e) {
    if ($(this).hasClass("profile-management")) {
      location.href = "/profile/email/";
    }

    if ($(this).hasClass("topic-management")) {
      location.href = "/profile/topicMgt/";
    }
  });

  //quick links
  $("#quick-links").on("click", "div.item", function(e) {
    e.preventDefault();

    let href = $(this).attr("data-href");
    location.href = href;
  });
}

export default {
  initialize() {
    createClickHandlers();

    //get pagekey and setup copy to clipboard
    if ($(".copy-page-key").length > 0) {
      let pageKey = key.genPageKey();
      $(".copy-page-key").attr("data-clipboard-text", pageKey).text(`Key: ${pageKey}`);
      clipboard.register(".copy-page-key");
    }
  }
};
