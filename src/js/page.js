/* eslint no-console: off */

//common modules
import auth from "www/modules/_user/netlify";
import {initStickyMenu, initAnimation} from "www/modules/_page/startup";

//teaching specific modules
import {bookmarkStart} from "./modules/_bookmark/start";
import search from "./modules/_search/search";
import toc from "./modules/_contents/toc";
import about from "./modules/_about/about";

import {setLanguage} from "www/modules/_language/lang";
import constants from "./constants";

$(document).ready(() => {
  initStickyMenu();
  setLanguage(constants);

  bookmarkStart("page");
  search.initialize();
  auth.initialize();
  toc.initialize("page");
  about.initialize();

  initAnimation();
});

