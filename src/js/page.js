/* eslint no-console: off */

import "../vendor/semantic/semantic.min.js";
import bookmark from "./modules/_bookmark/bookmark";
import search from "./modules/_search/search";
import toc from "./modules/_contents/toc";
import auth from "./modules/_user/netlify";
import about from "./modules/_about/about";
import constants from "./constants";

/*
  Fix main menu to top of page when scrolled
*/
function initStickyMenu() {
  // fix main menu to page on passing
  $(".main.menu").visibility({
    type: "fixed"
  });

  //show dropdown on hover
  $(".main.menu  .ui.dropdown").dropdown({
    on: "hover"
  });
}

$(document).ready(() => {
  initStickyMenu();
  constants.setLinks();

  bookmark.initialize();
  search.initialize();
  auth.initialize();
  toc.initialize("page");
  about.initialize();

});

