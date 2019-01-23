/*eslint no-console: "off" */

import user from "netlify-identity-widget";
import md5 from "md5";
import {getUser} from "../_util/url";

let userInfo;

let testUsers = {
  "rick": { 
    email: "rmercer33@gmail.com",
    userId: md5("rmercer33@gmail.com"),
    name: "Rick Mercer",
    roles: ["timer", "editor"]
  },
  "julie": { 
    email: "julief8@me.com",
    userId: md5("julief8@me.com"),
    name: "Julie Franklin",
    roles: ["timer", "editor"]
  },
  "yodi": { 
    email: "yodi@yodith.com",
    userId: md5("yodi@yodith.com"),
    name: "Yodi Debebe",
    roles: ["timer"]
  },
  "hettie": { 
    email: "hcmercer@gmail.com",
    userId: md5("hcmercer@gmail.com"),
    name: "Hettie Mercer",
    roles: []
  }
};

function devUserInfo() {
  let user = getUser();

  if (user && testUsers[user]) {
    return testUsers[user];
  }
  else {
    //use rick
    return testUsers["rick"];
  }

  return null;
}

function prodUserInfo() {
  if (userInfo) {
    return {
      email: userInfo.email,
      userId: md5(userInfo.email),
      name: userInfo.user_metadata.full_name,
      roles: userInfo.app_metadata.roles,
      avatar_url: userInfo.user_metadata.avatar_url
    };
  }

  return null;
}

export function getUserInfo(name) {
  if (location.hostname !== "localhost") {
    return prodUserInfo();
  }
  else {
    return devUserInfo(name);
  }
}

/*
  Modify menubar icons "bookmark" and "sign in" to 
  indicate user is signed in
*/
function setAsSignedIn() {
  let userInfo = getUserInfo();

  //change sign-in icon to sign-out and change color from red to green
  $(".login-menu-option > span")
    .html("<i class='green sign out icon'></i>")
    .attr("data-tooltip", `Sign Out: ${userInfo.name}`);

  //change bookmark menu icon to green from red
  $(".main.menu a > span > i.bookmark.icon")
    .addClass("green")
    .removeClass("red");

  //add color to menu background to further indicate signed in status
  $(".main.menu .ui.text.container").addClass("signed-in");
}

/*
  Modify menubar icons "bookmark" and "sign in" to 
  indicate user is signed in
*/
function setAsSignedOut() {
  //change sign-in icon to sign-out and change color from red to green
  $(".login-menu-option > span")
    .html("<i class='red sign in icon'></i>")
    .attr("data-tooltip", "Sign In");

  //change bookmark menu icon to green from red
  $(".main.menu a > span > i.bookmark.icon")
    .addClass("red")
    .removeClass("green");

  //removed signed-in class
  $(".main.menu .ui.text.container").removeClass("signed-in");
}

export default {

  initialize: function() {
    //console.log("Init user authentication");

    /*
     * if user already logged in, change icon to log out
     */
    user.on("init", user => {
      //console.log("user.on('init')");
      userInfo = user;
      if (userInfo) {
        setAsSignedIn();
      }
    });

    user.on("login", login => {
      //console.log("user.on('login')");
      userInfo = login;
      setAsSignedIn();
    });

    user.on("logout", () => {
      //console.log("user.logout()");
      setAsSignedOut();
      userInfo = null;
      location.href = "/";
    });

    user.on("error", (err) => console.error("user.on('error'): ", err));

    $(".login-menu-option").on("click", (e) => {
      e.preventDefault();

      if (userInfo) {
        user.logout();
      }
      else {
        user.open();
      }
    });

    //init authentication
    user.init({
      //container: "#netlify-modal"
    });
  }
};

