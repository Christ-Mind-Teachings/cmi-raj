/*
  Teaching specific data
*/

const keyInfo = require("./modules/_config/key");
import {getReservation, getAudioInfo, getPageInfo} from "./modules/_config/config";

const env = "integration";
const sid = "raj";
const lang = "en";
const title = "The Raj Material";
const HOME_URI = `/t/${sid}`;

export default {
  sid: sid,
  env: env,
  lang: lang,
  title: title,
  url_prefix: HOME_URI,
  configUrl: `${HOME_URI}/public/config`,
  sourceId: 13,
  quoteManagerId: "05399539cca9ac38db6db36f5c770ff1",
  quoteManagerName: "CMI",
  getPageInfo: getPageInfo,
  keyInfo: keyInfo,
  audio: {
    audioBase: `https://s3.amazonaws.com/assets.christmind.info/nwffacim/audio`,
    timingBase: `${HOME_URI}/public/timing`,
    getReservation: getReservation,
    getAudioInfo: getAudioInfo
  },
  store: {
    bmList: "bm.list",
    bmCreation: "bm.creation",
    bmTopics: "bm.topics",
    bmModal: "bm.modal",
    srchResults: "srch.results",
    pnDisplay: "pn.display",
    cfgacq: "cfg.acq",
    cfgacim: "cfg.acim",
    cfggrad: "cfg.grad",
    cfgyaa: "cfg.yaa",
    cfgsg2002: "cfg.sg2002",
    cfgsg2003: "cfg.sg2003",
    cfgsg2004: "cfg.sg2004",
    cfgsg2005: "cfg.sg2005",
    cfgsg2006: "cfg.sg2006",
    cfgsg2007: "cfg.sg2007",
    cfgsg2008: "cfg.sg2008",
    cfgsg2009: "cfg.sg2009",
    cfgsg2010: "cfg.sg2010",
    cfgsg2011: "cfg.sg2011",
    cfgsg2012: "cfg.sg2012",
    cfgsg2013: "cfg.sg2013",
    cfgsg2014: "cfg.sg2014",
    cfgsg2015: "cfg.sg2015",
    cfgsg2016: "cfg.sg2016",
    cfgsg2017: "cfg.sg2017",
    cfgsg2018: "cfg.sg2018",
    cfgshorts: "cfg.shorts"
  }
};
