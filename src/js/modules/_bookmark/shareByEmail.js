import constants from "../../constants";
import {getUserInfo} from "../_user/netlify";
import axios from "axios";
import notify from "toastr";
import { loadEmailListTable } from "../_user/email";

let shareInfo = {};

//load email list and setup submit and cancel listeners
export function initShareByEmail() {
  loadEmailList();

  //submit
  $("form[name='emailshare']").on("submit", function(e) {
    e.preventDefault();

    const userInfo = getUserInfo();
    if (!userInfo) {
      notify.warning("You must be signed in to share bookmarks.");
      $(".email-share-dialog-wrapper").addClass("hide");
      return;
    }

    let formData = $("#email-share-form").form("get values");

    if (formData.mailList.length === 0 && formData.emailAddresses.length === 0) {
      notify.info("Please enter at least one email address.");
      return;
    }

    shareInfo.to = "";
    if (formData.mailList.length > 0) {
      shareInfo.to = formData.mailList.join(",");
    }

    if (formData.emailAddresses.length > 0) {
      if (shareInfo.to.length > 0) {
        shareInfo.to = `${shareInfo.to}, ${formData.emailAddresses}`;
      }
      else {
        shareInfo.to = formData.emailAddresses;
      }
    }

    shareInfo.senderName = userInfo.name;
    shareInfo.senderEmail = userInfo.email;
    shareInfo.sid = constants.sid;
    //console.log("shareInfo: %o", shareInfo);

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

//generate the option element of a select statement
function generateOption(item) {
  return `<option value="${item.address}">${item.first} ${item.last}</option>`;
}

function makeMaillistSelect(maillist) {
  return (`
    <label>Mail List Names</label>
    <select name="mailList" id="maillist-address-list" multiple="" class="search ui dropdown">
      <option value="">Select Email Address(es)</option>
      ${maillist.map(item => `${generateOption(item)}`).join("")}
    </select>
  `);
}

/*
  Called by initShareByEmail()
  - load only when user signed in, fail silently, it's not an error
*/
function loadEmailList() {
  const userInfo = getUserInfo();

  if (!userInfo) {
    return;
  }

  let maillist = [];
  let api = `${userInfo.userId}/maillist`;

  axios(`${constants.user}/${api}`)
    .then(response => {
      maillist = response.data.maillist;
      let selectHtml = makeMaillistSelect(maillist);

      $("#maillist-select").html(selectHtml);
      $("#maillist-address-list.dropdown").dropdown();
    })
    .catch(err => {
      notify.error("Error getting email list: ", err);
    });
}

/*
*/
export function shareByEmail(quote, citation, url) {
  shareInfo = {citation, quote, url};

  //show input form
  $(".hide.email-share-dialog-wrapper").removeClass("hide");
}
