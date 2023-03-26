/* eslint no-console: off */
import {SourceStore, storeInit} from "www/modules/_util/store";
import search from "www/modules/_search/search";

//common modules
import auth from "www/modules/_user/netlify";
import {initStickyMenu, initAnimation} from "www/modules/_page/startup";

//teaching specific modules
import {bookmarkStart} from "./modules/_bookmark/start";
import {searchInit} from "./modules/_search/search";
import toc from "./modules/_contents/toc";
import about from "./modules/_about/about";
import {initQuoteDisplay} from "www/modules/_topics/events";

import {setLanguage} from "www/modules/_language/lang";
import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);
  initStickyMenu();
  setLanguage(constants);

  auth.initialize();
  bookmarkStart("page");
  search.initialize(searchInit(store));
  toc.initialize("page");
  about.initialize();
  initQuoteDisplay("#show-quote-button", constants);

  initAnimation();
});

