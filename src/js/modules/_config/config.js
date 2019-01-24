import store from "store";
import axios from "axios";

//import {decodeKey, parseKey, genKey} from "./key";
const transcript = require("./key");

//change these values to reflect transcript info
const AWS_BUCKET = "assets.christmind.info";

//this is the id used on aws s3 to store audio files
const SOURCE_ID = "nwffacim";

//mp3 and audio timing base directories
const audioBase = `https://s3.amazonaws.com/${AWS_BUCKET}/${SOURCE_ID}/audio`;
const timingBase = "/public/timing";

//location of configuration files
const configUrl = "/public/config";

//the current configuration, initially null, assigned by getConfig()
let config;

/* 
  check if config has changed since we last stored it
*/
function refreshNeeded(bid) {
  if (location.hostname === "localhost") {
    console.log("reloading config for %s", bid);
    return true;
  }

  return false;
}

function requestConfiguration(url) {
  return axios.get(url);
}

/*
  Fetch audio timing data
*/
export function fetchTimingData(url) {
  return new Promise((resolve, reject) => {
    axios.get(`${timingBase}${url}`)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/*
  We use book level configuration that is loaded by request via AJAX. Once
  loaded the config is persisted in local storage. A check is made for
  configuration data loaded from storage to determine if the data needs to
  be reloaded. This is indicated using Define-webpack-plugin to set the timestamp
  of configurations that have changed.

  args:
    book: the book identifier, woh, wot, etc
    assign: when true, assign global variable 'config' to retrieved data
*/
export function getConfig(book, assign = true) {
  return new Promise((resolve, reject) => {
    let cfg = store.get(`config-${book}`);
    let url;

    //if config in local storage check if we need to get a freash copy
    if (cfg && !refreshNeeded(cfg.bid, cfg.lastFetchDate)) {
      if (assign) {
        config = cfg;
      }
      resolve(cfg);
      return;
    }

    //get config from server
    url = `${configUrl}/${book}.json`;
    requestConfiguration(url)
      .then((response) => {
        //add fetch date before storing
        response.data.lastFetchDate = Date.now();
        store.set(`config-${book}`, response.data);
        if (assign) {
          config = response.data;
        }
        resolve(response.data);
      })
      .catch(() => {
        config = null;
        reject(`Config file: ${url} is not valid JSON`);
      });
  });
}

/*
  For transcript pages; load the configuration file.
  For non-transcript pages; configuration is loaded by getConfig()

  This is the same as getConfig() except it doesn't resolve passing the data
  but a message indicating source of the configuration file

  loadConfig resolves with:
    0: no ${book}.json file found
    1: config loaded from local store
    2: config loaded from server
*/
export function loadConfig(book) {
  return new Promise((resolve, reject) => {
    if (typeof book === "undefined") {
      resolve(0);
      return;
    }
    let cfg = store.get(`config-${book}`);
    let url;

    //if config in local storage check if we need to get a freash copy
    if (cfg && !refreshNeeded(cfg.bid, cfg.lastFetchDate)) {
      config = cfg;
      resolve("config read from cache");
      return;
    }

    //get config from server
    url = `${configUrl}/${book}.json`;
    requestConfiguration(url)
      .then((response) => {
        //add fetch date before storing
        response.data.lastFetchDate = Date.now();
        store.set(`config-${book}`, response.data);
        config = response.data;
        resolve("config fetched from server");
      })
      .catch((error) => {
        config = null;
        reject(`Config file: ${url} is not valid JSON`);
      });
  });
}

/*
  get audio info from config file
*/
function _getAudioInfo(cIdx) {
  let audioInfo;

  //subtract 1 because value comes from the key which is plus 1
  audioInfo = config.contents[cIdx - 1];
  return audioInfo ? audioInfo: {};
}

export function getAudioInfo(url) {
  //check that config has been initialized
  if (!config) {
    throw new Error("Configuration has not been initialized");
  }

  //remove leading and trailing "/"
  url = url.substr(1);
  url = url.substr(0, url.length - 1);

  let idx = url.split("/");

  //check the correct configuration file is loaded
  if (config.bid !== idx[0]) {
    throw new Error("Unexpected config file loaded; expecting %s but %s is loaded.", idx[0], config.bid);
  }

  let audioInfo = {};
  let cIdx;

  switch(idx[0]) {
    //these don't have audio
    case "grad":
    case "yaa":
      break;
    default:
      cIdx = transcript.getUnitId(idx[0], idx[1]);
      audioInfo = _getAudioInfo(cIdx);
      break;
  }

  audioInfo.audioBase = audioBase;
  return audioInfo;
}

/*
 * get timer info for the current page
 */
export function getReservation(url) {
  let audioInfo = getAudioInfo(url);

  if (audioInfo.timer) {
    return audioInfo.timer;
  }

  return null;
}

/*
  Given a page key, return data from a config file

  returns: book title, page title, url and optionally subtitle.

  args:
    pageKey: a key uniuely identifying a transcript page
    data: optional, data that will be added to the result, used for convenience
*/
export function getPageInfo(pageKey, data = false) {
  let decodedKey = transcript.decodeKey(pageKey);
  let info = {pageKey: pageKey, bookId: decodedKey.bookId};

  if (data) {
    info.data = data;
  }

  return new Promise((resolve, reject) => {

    //get configuration data specific to the bookId
    getConfig(decodedKey.bookId, false)
      .then((data) => {
        info.bookTitle = data.title;
        info.title = data.contents[decodedKey.uid].title;
        info.url = `${data.base}${data.contents[decodedKey.uid].url}`;

        resolve(info);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
