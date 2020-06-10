/* eslint no-console: off */

//common modules
import {showParagraph, loadStart} from "www/modules/_util/url";
import auth from "www/modules/_user/netlify";
import fb from "www/modules/_util/facebook";
import {initTranscriptPage} from "www/modules/_page/startup";

//teaching specific modules
import {loadConfig} from "./modules/_config/config";
import {bookmarkStart} from "./modules/_bookmark/start";
import search from "./modules/_search/search";
import toc, {getBookId} from "./modules/_contents/toc";
import audio from "./modules/_audio/audio";
import about from "./modules/_about/about";

import {setLanguage} from "www/modules/_language/lang";
import constants from "./constants";

$(document).ready(() => {

  loadStart();
  setLanguage(constants);
  initTranscriptPage();
  auth.initialize();
  fb.initialize();
  about.initialize();

  loadConfig(getBookId())
    .then((result) => {
      search.initialize();

      /*
        result of 0 indicates no contents config found
        - toc, and audio depend on config file
      */
      if (result !== 0) {
        toc.initialize("transcript");
        audio.initialize();
      }
      showParagraph();
      bookmarkStart("transcript");

      if ($(".disable-paragraph-marker").length > 0) {
        console.log("disable paragraph markers");
        $(".toggle-paragraph-markers").eq(0).trigger("click");
      }
    })
    .catch((error) => {
      //report error to the user - somehow
      console.error(error);
    });
});
