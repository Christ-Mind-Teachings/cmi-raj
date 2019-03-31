/* eslint no-console: off */

import "../vendor/semantic/semantic.min.js";
import bookmark from "./modules/_bookmark/bookmark";
import search from "./modules/_search/search";
import toc from "./modules/_contents/toc";
import auth from "./modules/_user/netlify";
import about from "./modules/_about/about";
import {TweenMax} from "gsap";

function initAnimation() {
  let delay = 0.2;
  $("#page-contents").on("mouseover", "[data-book]", function(e) {
    console.log("mouse over");
    TweenMax.to($(this), delay, {className: "+=gsap-hover"});
    TweenMax.to($(this), delay, {scale: "1.1"});
  });
  $("#page-contents").on("mouseout", "[data-book]", function(e) {
    console.log("mouse over");
    TweenMax.to($(this), delay, {className: "-=gsap-hover"});
    TweenMax.to($(this), delay, {scale: "1.0"});
  });
  $("#page-contents2").on("mouseover", "[data-book]", function(e) {
    console.log("mouse over");
    TweenMax.to($(this), delay, {className: "+=gsap-hover"});
    TweenMax.to($(this), delay, {scale: "1.1"});
  });
  $("#page-contents2").on("mouseout", "[data-book]", function(e) {
    console.log("mouse over");
    TweenMax.to($(this), delay, {className: "-=gsap-hover"});
    TweenMax.to($(this), delay, {scale: "1.0"});
  });
}

/*
  Fix main menu to top of page when scrolled
*/
function initStickyMenu() {
  // fix main menu to page on passing
  $(".main.menu").visibility({
    type: "fixed"
  });

  //show dropdown on hover
  $(".main.menu  .ui.dropdown").dropdown({
    on: "hover"
  });
}

$(document).ready(() => {
  initStickyMenu();

  bookmark.initialize();
  search.initialize();
  auth.initialize();
  toc.initialize("page");
  about.initialize();

  initAnimation();
});

