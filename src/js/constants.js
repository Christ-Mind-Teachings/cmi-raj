/*
  Teaching specific data
*/

const keyInfo = require("./modules/_config/key");
import {getPageInfo} from "./modules/_config/config";

export default {
  sid: "raj",
  env: "integration",
  lang: "en",
  sourceId: 13,
  url_prefix: "/t/raj",
  getPageInfo: getPageInfo,              //list
  keyInfo: keyInfo,                      //list, bmnet
  store: {
    bmList: "bm.list",
    bmCreation: "bm.creation",
    bmTopics: "bm.topics",
    bmModal: "bm.modal",
    srchResults: "srch.results",
    pnDisplay: "pn.display",
    cfgacq: "cfg.acq",
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
    cfgsg2018: "cfg.sg2018"
  }
};
