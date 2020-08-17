/*
  Initialize bookmark modules
*/

//bookmark code common to all teachings
import bookmark from "www/modules/_bookmark/bookmark";
import {initShareByEmail} from "www/modules/_bookmark/shareByEmail";
import share from "www/modules/_share/share";

//teaching specific 
import constants from "../../constants";
import { getPageInfo } from "../_config/config";

//export function bookmarkStart(pid) {
export function bookmarkStart(page) {
  let pid;
  if (page === "transcript") {
    share.initialize(constants).then((pid) => {
      bookmark.initialize(pid, constants);
    });

    //get page info and set as heading under '?' menu option
    let key = constants.keyInfo.genPageKey();
    getPageInfo(key)
      .then((info) => {
        //console.log("pageInfo: %o", info);
        let title = `${info.source}<br/>${info.bookTitle}`;

        if (info.subTitle) {
          title = `${title}<br/>${info.subTitle}`;
        }

        title = `${title}<br/>${info.title}`;
        $("#transcript-page-info").html(title);
      });
  }
  //init bookmark for non-transcript pages.
  else {
    bookmark.initialize(pid, constants);
  }
  initShareByEmail(constants);
}
