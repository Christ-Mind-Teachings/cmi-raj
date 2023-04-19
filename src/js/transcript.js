/* eslint no-console: off */

import {SourceStore, storeInit} from "common/modules/_util/store";
import search from "common/modules/_search/search";
import {showParagraph} from "common/modules/_util/url";
import auth from "common/modules/_user/netlify";
import fb from "common/modules/_util/facebook";
import {initTranscriptPage} from "common/modules/_page/startup";
import audio from "common/modules/_audio/audio";

//teaching specific modules
import {setEnv, loadConfig} from "./modules/_config/config";
import {bookmarkStart} from "./modules/_bookmark/start";
import {searchInit} from "./modules/_search/search";
import toc, {getBookId} from "./modules/_contents/toc";
import about from "./modules/_about/about";

import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);
  auth.initialize();

  initTranscriptPage("pnDisplay");
  fb.initialize();
  about.initialize();

  setEnv(store);

  loadConfig(getBookId()).then((result) => {
    search.initialize(searchInit(store));
    toc.initialize("transcript");
    audio.initialize(store);
    showParagraph();
    bookmarkStart("transcript", store);
  }).catch((error) => {
    console.error(error);
  });
});
