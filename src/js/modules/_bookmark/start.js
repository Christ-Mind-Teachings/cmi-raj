/*
  Initialize bookmark modules
*/

//bookmark code common to all teachings
import bookmark from "www/modules/_bookmark/bookmark";
import {initShareByEmail} from "www/modules/_bookmark/shareByEmail";
import share from "www/modules/_share/share";

//teaching specific 
import constants from "../../constants";

//export function bookmarkStart(pid) {
export function bookmarkStart(page) {
  let pid;
  if (page === "transcript") {
    pid = share.initialize(constants);
  }
  bookmark.initialize(pid, constants);
  initShareByEmail(constants);
}
