import scroll from "scroll-into-view";

//timeout interval before calling scroll
const INTERVAL = 250;

// get query string from window.location unless the arg 'qString' is not
// null, in that case it represents the query string
function getQueryString(key, qString) {
  let queryString;

  if (qString) {
    queryString = qString.substring(1);
  }
  else {
    queryString = window.location.search.substring(1);
  }
  let vars = queryString.split("&");

  for(let i=0; i<vars.length; i++) {
    let getValue = vars[i].split("=");
    if (getValue[0] === key) {
      return getValue[1];
    }
  }
  return null;
}

function scrollComplete(message, type) {
  //console.log(`${message}: ${type}`);
}

function scrollIntoView(id, caller) {
  scroll(document.getElementById(id), {align: {top: 0.2}}, (type) => {
    scrollComplete(`scroll from url.js ${caller}(${id})`, type);
  });
}

//called when query request is complete
export function loadComplete() {
  $("#transcript-page-loading").removeClass("active");
}

//show loading for long loading steps - like showing annotations
export function loadStart() {
  let aInfo = getQueryString("as");

  if (aInfo) {
    $("#transcript-page-loading").addClass("active");
  }
}

/*
  Check for url query string requesting to scroll given paragraph into view
  Syntax: ?v=pid, example: ?v=p20

  Scroll paragraph 20 into view on page load
*/
export function showParagraph() {
  let pId = getQueryString("v");
  if (pId) {
    setTimeout(scrollIntoView, INTERVAL, pId, "showParagraph");
  }
}

export function showBookmark() {
  let pId = getQueryString("bkmk");

  if (pId) {
    return pId;
  }
  return null;
}

export function showSearchMatch() {
  let pId = getQueryString("srch");

  if (pId) {
    //setTimeout(scrollIntoView, INTERVAL, pId, "showSearchMatch");
    return pId;
  }
  return null;
}

export function showAnnotation() {
  let aInfo = getQueryString("as");

  if (aInfo) {
    return aInfo;
  }
  return null;
}

/*
  used for testing
*/
export function getUser() {
  let user = getQueryString("user");

  if (user) {
    return user;
  }

  return null;
}
