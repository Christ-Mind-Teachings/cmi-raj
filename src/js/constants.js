/*
  Teaching specific data
*/

const keyInfo = require("./modules/_config/key");
import {getPageInfo} from "./modules/_config/config";

export default {
  sid: "RAJ",
  getPageInfo: getPageInfo,              //list
  keyInfo: keyInfo,                      //list, bmnet
  bm_modal_key: "bm.raj.modal",         //list
  bm_creation_state: "bm.raj.creation", //bookmark
  bm_list_store: "bm.raj.list",         //bmnet
  bm_topic_list: "bm.raj.topics",       //bmnet
  bm_modal_store: "bm.raj.modal",       //navigator
  url_prefix: "/t/raj"                  //navigator
};
