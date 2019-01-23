/*
  Bookmark data implementation

  Bookmarks for signed in users are queried from and stored to the server. See the
  cmi-api/bookmark repository for API.

  For signed in users, when a transcript page is loaded bookmarks are queried from the server
  and stored locally. Bookmarks for users not signed in are stored only to lcoal storage.

  Operations for create, modify, and delete are performed locally and sent to the server
  for signed in users.
*/

import axios from "axios";
import store from "store";
import notify from "toastr";
import {getUserInfo} from "../_user/netlify";
import {updateSelectedText} from "./selection";

import isEqual from "lodash/isEqual";
import findIndex from "lodash/findIndex";
import cloneDeep from "lodash/cloneDeep";

//import {parseKey, getKeyInfo, genPageKey, genParagraphKey } from "../_config/key";
const transcript = require("../_config/key");

//Index topics
const topicsEndPoint = "https://93e93isn03.execute-api.us-east-1.amazonaws.com/latest";

//Bookmark API
const bookmarkApi = "https://rcd7l4adth.execute-api.us-east-1.amazonaws.com/latest";

/*
  Get bookmark for paragraph pid from local storage. All bookmarks for the page
  are loaded by getBookmarks() and stored locally. We don't need to fetch them again.

  args:
    pid: paragraph id

  Bookmarks are keyed by pageKey and paragraphId. Paragraph Id's start from zero
  but are incremented by one to form the key.
*/
export function getBookmark(pid) {
  const pageKey = transcript.genPageKey();
  const bookmarks = store.get(pageKey);

  if (bookmarks && pid) {
    //generate id
    let id = parseInt(pid.substr(1), 10) + 1;

    if (bookmarks[id]) {
      return {bookmark: bookmarks[id]};
    }
  }
  //no bookmark found
  return {};
}

/*
  if user not logged in get bookmarks from local storage
  otherwise get them from the server and store them locally
*/
function getBookmarks() {
  let pageKey = transcript.genPageKey();
  const userInfo = getUserInfo();

  return new Promise((resolve, reject) => {

    //get bookmarks from server
    if (userInfo) {
      axios.get(`${bookmarkApi}/bookmark/query/${userInfo.userId}/${pageKey}`)
        .then((response) => {

          //convert to local data structure and store locally 
          if (response.data.response) {
            let bookmarks = {};
            response.data.response.forEach((b) => {
              let key = transcript.parseKey(b.id);

              //parson JSON to object
              for (let a of b.bookmark) {
                if (a.selectedText) {
                  a.selectedText = JSON.parse(a.selectedText);
                }
                //console.log("a: %o", a);
              }
              bookmarks[key.pid] = b.bookmark;
            });

            //store bookmarks in local storage
            if (Object.keys(bookmarks).length > 0) {
              store.set(pageKey, bookmarks);
            }
            resolve(bookmarks);
          }
        })
        .catch((err) => {
          reject(err);
        });
    }
    else {
      //get from local storage
      const bookmarks = store.get(pageKey);
      resolve(bookmarks);
    }
  });
}

/*
  if user not logged in get bookmarks from local storage
  otherwise get them from the server and store them locally
*/
function queryBookmarks(key) {
  const retentionTime = 1000 * 60 * 60 * 8; //eight hours of milliseconds
  const userInfo = getUserInfo();
  const keyInfo = transcript.getKeyInfo();

  return new Promise((resolve, reject) => {
    //get bookmarks from server
    if (userInfo) {
      //set if bookmarks are already in local storage
      let bookmarkList = getBookmarkList(keyInfo);

      //don't query database - just return from local storage
      if (bookmarkList) {
        let expireDate = bookmarkList.lastFetchDate + retentionTime;

        //if list has not expired or been invalidated resolve and return
        //otherwise query the server
        if (Date.now() < expireDate) {
          if (bookmarkList.lastBuildDate > 0) {
            resolve(bookmarkList);
            return;
          }
        }
      }

      //get from the server
      axios.get(`${bookmarkApi}/bookmark/query/${userInfo.userId}/${key}`)
        .then((response) => {
          //convert to local data structure and store locally 
          if (response.data.response) {
            //console.log("bookmarks: %o", response.data.response);

            //convert selectedText from JSON to object
            for (let b of response.data.response) {
              for (let a of b.bookmark) {
                if (a.selectedText) {
                  a.selectedText = JSON.parse(a.selectedText);
                }
                //console.log("a: %o", a);
              }
            }
            let bookmarks = buildBookmarkListFromServer(response, keyInfo);
            resolve(bookmarks);
          }
        })
        .catch((err) => {
          reject(err);
          return;
        });
    }
    else {
      /*
      let sid = parseInt(keyInfo.sourceId, 10);
      let bookmarks = [];

      //build expected structure from local storage
      store.each((value, key) => {
        if (key.startsWith(sid)) {
          if (!bookmarks[key]) {
            bookmarks[key] = {};
          }
          bookmarks[key] = value;
        }
      });
      console.log("queryBookmarks: list from local store, user not signed in");
      */
      let bookmarks = buildBookmarkListFromLocalStore(keyInfo);
      resolve(bookmarks);
    }
  });
}

function storeBookmarkList(bookmarks, keyInfo) {
  store.set(`bmList_${keyInfo.sourceId}`, bookmarks);
}

function getBookmarkList(keyInfo) {
  return store.get(`bmList_${keyInfo.sourceId}`);
}

/*
  This is for users not signed in
  Build BookmarkList from locally stored bookmarks. Once built, we only
  rebuild it if it has been invalidated by the modification or creation of
  a bookmark
*/
function buildBookmarkListFromLocalStore(keyInfo) {

  //check if the list needs to be rebuilt
  const list = getBookmarkList(keyInfo);
  if (list) {
    if (list.lastBuildDate > 0) {
      return list;
    }
  }

  let sid = parseInt(keyInfo.sourceId, 10);
  let bookmarks = {};

  //build expected structure from local storage
  store.each((value, key) => {
    if (key.startsWith(sid)) {
      if (!bookmarks[key]) {
        bookmarks[key] = {};
      }
      bookmarks[key] = value;
    }
  });
  bookmarks.lastBuildDate = Date.now();
  storeBookmarkList(bookmarks, keyInfo);

  return bookmarks;
}

/*
  Build Bookmark list from data returned from server
  - this is for users signed in
*/
function buildBookmarkListFromServer(response, keyInfo) {
  let bookmarks = {};
  response.data.response.forEach((b) => {
    let keyParts = transcript.parseKey(b.id);
    if (!bookmarks[keyParts.pageKey]) {
      bookmarks[keyParts.pageKey] = {};
    }
    bookmarks[keyParts.pageKey][keyParts.pid] = b.bookmark;
  });
  bookmarks.lastFetchDate = Date.now();
  bookmarks.lastBuildDate = Date.now();

  storeBookmarkList(bookmarks, keyInfo);
  return bookmarks;
}

/*
  Persist annotation 
    - in local storage and to server if user is signed in

  args: annotation
*/
function postAnnotation(annotation) {
  //console.log("annotation: ", annotation);
  const pageKey = transcript.genPageKey();
  const userInfo = getUserInfo();

  //the annotation creation data; aka annotationId, aid
  let now = Date.now();

  //post to server
  if (userInfo) {
    //this is critical, things get messed up if we don't do this
    let serverAnnotation = cloneDeep(annotation);

    if (serverAnnotation.selectedText) {
      delete serverAnnotation.selectedText.wrap;
    }

    if (serverAnnotation.selectedText && !serverAnnotation.selectedText.aid) {
      serverAnnotation.selectedText.aid = now.toString(10);
    }

    //convert selectedText to JSON
    serverAnnotation.selectedText = JSON.stringify(serverAnnotation.selectedText);

    let postBody = {
      userId: userInfo.userId,
      bookmarkId: transcript.genParagraphKey(serverAnnotation.rangeStart, pageKey),
      annotationId: serverAnnotation.creationDate ? serverAnnotation.creationDate : now,
      annotation: serverAnnotation
    };

    //console.log("posting: %o", serverAnnotation);
    axios.post(`${bookmarkApi}/bookmark/annotation`, postBody)
      .then((data) => {
        if (data.data.message !== "OK") {
          console.error("not OK message: %s", data.data.message);
          notify.error(data.data.message);
        }
        else {
          //store locally
          storeAnnotation(annotation, now);
        }
      })
      .catch((err) => {
        console.error(`Error saving annotation: ${err}`);
        notify.error("Error saving annotation, please try again");

        //if error and this is a new annotation we need to remove the highlight from the page
        console.log("postBody", postBody);
      });
  }
  else {
    //store locally
    storeAnnotation(annotation, now);
  }
}

/*
  Delete the annotation 'creationDate' for bookmark 'pid'
*/
function deleteAnnotation(pid, creationDate) {
  const pageKey = transcript.genPageKey();
  const userInfo = getUserInfo();

  //delete annotation from server
  if (userInfo) {
    let bookmarkId = transcript.genParagraphKey(pid, pageKey);

    axios.delete(`${bookmarkApi}/bookmark/annotation/${userInfo.userId}/${bookmarkId}/${creationDate}`)
      .then(() => {
        console.log("deleted annotation: %s/%s/%s", userInfo.userId, bookmarkId, creationDate);
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  return deleteLocalAnnotation(pid, creationDate);
}

/*
  Fetch requested bookmark from server
*/
export function fetchBookmark(bookmarkId, userId) {
  return new Promise((resolve, reject) => {
    axios.get(`${bookmarkApi}/bookmark/${userId}/${bookmarkId}`)
      .then((response) => {
        if (response.data.response.Item) {
          for (let a of response.data.response.Item.bookmark) {
            if (a.selectedText) {
              a.selectedText = JSON.parse(a.selectedText);
            }
          }
        }
        resolve(response.data.response);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/*
  When user is signed in the bookmark has been returned from the server
  and saved to local storage. We get the bookmark from there rather than 
  having to go back to the server.

  We get the bookmark from local storage when the user is not signed in also.
*/
function getAnnotation(pid, aid) {
  const pageKey = transcript.genPageKey();

  let data;
  let annotation;

  //remove the 'p' in pid
  pid = parseInt(pid.substr(1), 10) + 1;

  data = store.get(pageKey);
  if (!data) {
    throw new Error("Expected bookmark data not found in local storage");
  }

  if (!data[pid]) {
    throw new Error(`Expected annotations not found for pid ${pid}`);
  }

  //filter requested annotation from array
  annotation = data[pid].filter(a => a.creationDate === aid);

  //return requested annotation
  return annotation[0];
}

/*
  Fetch Indexing topics
  args: force=true, get topics from server even when we have them cached

  topics are cached for 2 hours (1000 * 60sec * 60min * 2) before being requested
  from server
*/
function fetchTopics() {
  const userInfo = getUserInfo();
  let topics = store.get("topic-list");

  //keep topics in cache for 2 hours
  const retentionTime = 60 * 1000 * 60 * 2;

  return new Promise((resolve, reject) => {
    //topics stored only in local store for users not signed in
    if (!userInfo) {
      //no topics created yet
      if (!topics) {
        topics = {
          lastFetchDate: 0,
          topics: []
        };
        store.set("topic-list", topics);
      }
      resolve(topics);
      return;
    }
    //user signed in
    else if (topics && ((topics.lastFetchDate + retentionTime) > Date.now())) {
      //return topics from cache
      resolve(topics);
      return;
    }

    let sourceId = transcript.getKeyInfo().sourceId.toString(10);

    //user signed in, we need to get topics from server
    axios.get(`${topicsEndPoint}/user/${userInfo.userId}/topics/${sourceId}`)
      .then((topicInfo) => {
        console.log("topicInfo.data: ", topicInfo.data);
        topicInfo.data.lastFetchDate = Date.now();
        store.set("topic-list", topicInfo.data);
        resolve(topicInfo.data);
      })
      .catch((error) => {
        console.error("Error fetching topicList: ", error);
        reject(error);
      });
  });
}

/*
  add new topics to topic-list in application store
*/
function addToTopicList(newTopics) {
  let topics = store.get("topic-list");
  let concatTopics = topics.topics.concat(newTopics);

  //improve sort
  concatTopics.sort((a, b) => {
    let aValue, bValue;

    //objects have value and topic keys, sort them by topic
    if (typeof a === "object") {
      aValue = a.topic.toLowerCase();
    }
    else {
      aValue = a.toLowerCase();
    }

    if (typeof b === "object") {
      bValue = b.topic.toLowerCase();
    }
    else {
      bValue = b.toLowerCase();
    }

    if (aValue < bValue) {
      return -1;
    }

    if (aValue > bValue) {
      return 1;
    }

    return 0;
  });

  topics.topics = concatTopics;
  store.set("topic-list", topics);

  //add topics to server if user signed in
  let userInfo = getUserInfo();
  if (userInfo) {
    let postBody = {
      userId: userInfo.userId,
      sourceId: transcript.getKeyInfo().sourceId,
      topicList: newTopics
    };
    console.log("newTopics: %o", newTopics);
    axios.post(`${topicsEndPoint}/user/topics`, postBody)
      .then((response) => {
        console.log("addToTopicList: %o", response.data);
      })
      .catch((err) => {
        console.error("addToTopicList error: %o", err);
      });
  }

  return topics;
}

/*
  Called when a bookmark has been created, modified or deleted. We check if the bookmark
  list exists and if it was created before a bookmark was modified. If so, the list needs
  to be rebuilt.
*/
function inValidateBookmarkList() {
  const keyInfo = transcript.getKeyInfo();

  let bmList = getBookmarkList(keyInfo);

  if (bmList) {
    console.log("invalidating bmList");
    bmList.lastBuildDate = 0;
    storeBookmarkList(bmList, keyInfo);
  }
}

/*
  store annotation locally
  - if bmList_<source> exists in local store set lastBuildDate = 0 to indicate
    it needs to be recreated.
*/
function storeAnnotation(annotation, creationDate) {
  const pageKey = transcript.genPageKey();

  //make annotation key
  let pid = parseInt(annotation.rangeStart.substr(1), 10) + 1;

  //get bookmark for page
  let data = store.get(pageKey);

  //modified/edited bookmark when it has a creationDate attribute
  if (annotation.creationDate) {

    //convert bookmark.creationDate to number
    annotation.creationDate = parseInt(annotation.creationDate, 10);

    if (!data[pid]) {
      throw new Error(`Expected bookmark ${pid} not found.`);
    }
    
    //find the index of the annotation in the bookmark
    let index = findIndex(data[pid], a => a.creationDate === annotation.creationDate);
    if (index === -1) {
      throw new Error(`Did not find annotation ${annotation.creationDate} for pid ${pid}`);
    }

    //annotation was not modified so return
    if (isEqual(data[pid][index], annotation)) {
      return;
    }
    else {
      data[pid][index] = annotation;
    }
  }
  //new annotation
  else {
    annotation.creationDate = creationDate;

    //add creation date to the selectedText attribute of new annotations
    if (annotation.selectedText) {
      annotation.selectedText.aid = creationDate.toString(10);

      //add data-aid to new highlite so that it can be edited with a click
      updateSelectedText(annotation.selectedText.id, annotation.selectedText.aid);
    }

    if (!data) {
      data = { [pid]: [annotation] };
    }
    else {
      if (data[pid]) {
        data[pid].push(annotation);
      }
      else {
        data[pid] = [annotation];
      }
    }
  }
  store.set(pageKey, data);
  inValidateBookmarkList();
}

/*
  delete local annotation

  args:
    pid: paragraph id
    aid: annotation id
*/
function deleteLocalAnnotation(pid, aid) {
  const pageKey = transcript.genPageKey();

  //make annotation id
  pid = parseInt(pid.substr(1), 10) + 1;

  let data = store.get(pageKey);
  if (!data) {
    throw new Error("Expect bookmark data not found in local storage");
  }

  let annotations = data[pid];
  //user pressed delete on an annotation that was not created yet
  if (!annotations) {
    return;
  }

  //filter deleted annotation from array
  data[pid] = annotations.filter(a => a.creationDate !== parseInt(aid,10));
  store.set(pageKey, data);

  //bookmark has been deleted invalidate bookmark list so it is rebuilt
  inValidateBookmarkList();

  //return number of annotations remaining for paragraph
  return data[pid].length;
}

export default {
  addToTopicList: addToTopicList,
  fetchTopics: fetchTopics,
  getAnnotation: getAnnotation,
  deleteAnnotation: deleteAnnotation,
  postAnnotation: postAnnotation,
  getBookmarks: getBookmarks,
  queryBookmarks: queryBookmarks
};
