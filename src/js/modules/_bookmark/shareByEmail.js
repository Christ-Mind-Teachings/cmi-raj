import constants from "../../constants";
import {getUserInfo} from "../_user/netlify";
import axios from "axios";
import notify from "toastr";

let shareInfo = {};

//setup submit and cancel listeners
export function initShareByEmail() {
  //submit
  $("form[name='emailshare']").on("submit", function(e) {
    e.preventDefault();

    let formData = $("#email-share-form").form("get values");

    if (formData.emailAddresses.length === 0) {
      notify.info("Please enter at least one email address.");
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) {
      notify.warning("You must be signed in to share bookmarks.");
      $(".email-share-dialog-wrapper").addClass("hide");
      return;
    }

    shareInfo.to = formData.emailAddresses;
    shareInfo.senderName = userInfo.name;
    shareInfo.senderEmail = userInfo.email;
    shareInfo.sid = constants.sid;
    console.log("shareInfo: %o", shareInfo);

    //hide form not sure if this will work
    $(".email-share-dialog-wrapper").addClass("hide");

    axios.post(constants.share, shareInfo)
      .then((response) => {
        if (response.status === 200) {
          notify.info("Email Sent!");
        }
        else {
          notify.info(response.data.message);
        }
      })
      .catch((error) => {
        console.error("share error: %s", error);
      });
  });

  //cancel
  $("form[name='emailshare'] .email-share-cancel").on("click", function(e) {
    e.preventDefault();

    //hide form
    $(".email-share-dialog-wrapper").addClass("hide");
  });
}

/*
*/
export function shareByEmail(quote, citation, url) {
  shareInfo = {citation, quote, url};

  //show input form
  $(".hide.email-share-dialog-wrapper").removeClass("hide");
}
