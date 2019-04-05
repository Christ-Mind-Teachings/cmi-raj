/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"page": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/public/js";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([1,"vendors~page~transcript","vendors~page","page~transcript"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/page.js":
/*!************************!*\
  !*** ./src/js/page.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function($) {/* harmony import */ var _vendor_semantic_semantic_min_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vendor/semantic/semantic.min.js */ "./src/vendor/semantic/semantic.min.js");
/* harmony import */ var _vendor_semantic_semantic_min_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_vendor_semantic_semantic_min_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _modules_bookmark_bookmark__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/_bookmark/bookmark */ "./src/js/modules/_bookmark/bookmark.js");
/* harmony import */ var _modules_search_search__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/_search/search */ "./src/js/modules/_search/search.js");
/* harmony import */ var _modules_contents_toc__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/_contents/toc */ "./src/js/modules/_contents/toc.js");
/* harmony import */ var _modules_user_netlify__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/_user/netlify */ "./src/js/modules/_user/netlify.js");
/* harmony import */ var _modules_about_about__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/_about/about */ "./src/js/modules/_about/about.js");
/* harmony import */ var gsap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! gsap */ "./node_modules/gsap/index.js");
/* eslint no-console: off */








function initAnimation() {
  let delay = 0.2;
  $("#page-contents").on("mouseover", "[data-book]", function (e) {
    console.log("mouse over");
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      className: "+=gsap-hover"
    });
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      scale: "1.1"
    });
  });
  $("#page-contents").on("mouseout", "[data-book]", function (e) {
    console.log("mouse over");
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      className: "-=gsap-hover"
    });
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      scale: "1.0"
    });
  });
  $("#page-contents2").on("mouseover", "[data-book]", function (e) {
    console.log("mouse over");
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      className: "+=gsap-hover"
    });
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      scale: "1.1"
    });
  });
  $("#page-contents2").on("mouseout", "[data-book]", function (e) {
    console.log("mouse over");
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      className: "-=gsap-hover"
    });
    gsap__WEBPACK_IMPORTED_MODULE_6__["TweenMax"].to($(this), delay, {
      scale: "1.0"
    });
  });
}
/*
  Fix main menu to top of page when scrolled
*/


function initStickyMenu() {
  // fix main menu to page on passing
  $(".main.menu").visibility({
    type: "fixed"
  }); //show dropdown on hover

  $(".main.menu  .ui.dropdown").dropdown({
    on: "hover"
  });
}

$(document).ready(() => {
  initStickyMenu();
  _modules_bookmark_bookmark__WEBPACK_IMPORTED_MODULE_1__["default"].initialize();
  _modules_search_search__WEBPACK_IMPORTED_MODULE_2__["default"].initialize();
  _modules_user_netlify__WEBPACK_IMPORTED_MODULE_4__["default"].initialize();
  _modules_contents_toc__WEBPACK_IMPORTED_MODULE_3__["default"].initialize("page");
  _modules_about_about__WEBPACK_IMPORTED_MODULE_5__["default"].initialize();
  initAnimation();
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! jquery */ "./node_modules/jquery/src/jquery.js")))

/***/ }),

/***/ 1:
/*!******************************!*\
  !*** multi ./src/js/page.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/js/page.js */"./src/js/page.js");


/***/ })

/******/ });
//# sourceMappingURL=page.js.map