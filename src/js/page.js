/* eslint no-console: off */

import {SourceStore, storeInit} from "common/modules/_util/store";
import {initHomePage} from "common/modules/_page/startup";
import search from "common/modules/_search/search";
import {showSearch, showQuotes, showTOC} from "common/modules/_util/url";
import {initQuoteDisplay} from "common/modules/_topics/events";

//teaching specific modules
import toc from "./modules/_contents/toc";
import {pageDriver} from "./modules/_util/driver";
import {setEnv} from "./modules/_config/config";

import constants from "./constants";

$(document).ready(() => {
  const store = new SourceStore(constants);
  storeInit(constants);

  setEnv(store);

  initHomePage(store, pageDriver);
  search.initialize(store);
  toc.initialize("page");

  initQuoteDisplay("#show-quote-button", store);

  //if url contains ?tocbook=[ack | book1 | book2] then show TOC on page load
  showTOC();

  //if url contains ?search=y then show search modal on page load
  showSearch();

  //if url contains ?quotes=y then show quotes modal on page load
  showQuotes();
});

