/*
  NOTE: When an annotation is shared and seen on a computer with bookmarks there could be a conflict between the users
        bookmarks and the shared bookmark. Not sure what to do in this case...

        An idea:
        Disable highlighting annotations on the paragraph of the shared annotation:w

        Approach:
        Load all bookmarks except that of a shared annotation.
        Add a close button to the shared annotation
        When the close button is pressed then add the omitted bookmark

*/
import {showAnnotation as showAnnotationRequest, loadComplete} from "../_util/url";
import {fetchBookmark} from "../_bookmark/bmnet";
import {highlightSkippedAnnotations, highlight} from "../_bookmark/selection";
import range from "lodash/range";
import scroll from "scroll-into-view";

const key = require("../_config/key");

//persist shared annotation so it can be unwraped when closed
let sharedAnnotation;

/*
  check if user has bookmark that was not highlighted due to shared annotion and
  highlight the bookmarks annotations. This is called if there is a problem getting
  the requested bookmark and when the user closes the share raised segment
*/
function clearSharedAnnotation() {
  console.log("clearSharedAnnotation");

  //unwrap shared annotation
  if (sharedAnnotation.selectedText) {
    sharedAnnotation.selectedText.wrap.unwrap();
  }

  //remove wrapper
  $("#shared-annotation-wrapper > .header").remove();
  $(".shared-selected-annotation").unwrap();
  $(".selected-annotation").removeClass("shared-selected-annotation");
  $(".bookmark-selected-text.shared").removeClass("shared");

  //highlight user annotations that were skipped because they were on same paragraph as shared annotation
  highlightSkippedAnnotations();
}

function initCloseHandler() {
  $(".share-annotation-close").on("click", function(e) {
    e.preventDefault();
    clearSharedAnnotation();
  });
}

//highlights an annotation by wrapping it in a segment
function wrapRange(annotation) {
  let rangeArray = [annotation.rangeStart, annotation.rangeEnd];
  let numericRange = rangeArray.map((r) => parseInt(r.substr(1),10));
  let annotationRange = range(numericRange[0], numericRange[1] + 1);
  let header = `
    <h4 class="ui header">
      <i title="Close" class="share-annotation-close small window close icon"></i>
      <div class="content">
        ${annotation.Comment}
      </div>
    </h4>
  `;

  for (let i = 0; i < annotationRange.length; i++) {
    $(`#p${annotationRange[i]}`).addClass("shared-selected-annotation");
  }

  $(".shared-selected-annotation").wrapAll("<div id='shared-annotation-wrapper' class='ui raised segment'></div>");
  $("#shared-annotation-wrapper").prepend(header);

  //scroll into view
  scroll(document.getElementById("shared-annotation-wrapper"), {align: {top: 0.2}});
}

/*
  Display annotation requested by query parameter "as"
  ?as=pid:annotationId:userId
*/
function showAnnotation() {
  let info = showAnnotationRequest();
  if (!info) {
    return false;
  }

  let [pid, aid, uid] = decodeURIComponent(info).split(":");

  //make sure pid exists
  if (!pid) {
    return false;
  }

  if ($(`#${pid}`).length === 0) {
    // console.log("invalid pid: %s", pid);
    return false;
  }

  let bookmarkId = key.genParagraphKey(pid);

  /*
    fetch shared bookmark and wrap it in a raised segment
    - if user has a bookmark in the same paragraph as the shared annotation, it will not be highlighted so
      if we fail to get the bookmark or can't find the shared annotation we need to highlight the users
      annotations for the paragraph before returning
  */
  fetchBookmark(bookmarkId, uid)
    .then((response) => {
      //bookmark not found
      if (!response.Item) {
        // console.log("bookmark not found");
        highlightSkippedAnnotations();
        return;
      }

      let bookmark = response.Item.bookmark;
      // console.log("bookmark from fetch: %o", bookmark);

      let annotation = bookmark.find((a) => a.creationDate.toString(10) === aid);

      if (!annotation) {
        // console.log("annotation not found");
        highlightSkippedAnnotations();
        return;
      }
      // console.log("annotation: %o", annotation);

      let node = document.getElementById(annotation.rangeStart);

      if (annotation.selectedText) {
        highlight(annotation.selectedText, node);
      }

      $(`[data-aid="${aid}"]`).addClass("shared");

      wrapRange(annotation);
      sharedAnnotation = annotation;

      initCloseHandler();
      //console.log("sharing pid: %s", pid);

      //stop page loading indicator
      loadComplete();
    })
    .catch((err) => {
      //stop page loading indicator
      loadComplete();

      console.error(err);
    });

  return pid;
}

export default {
  initialize: function() {
    return showAnnotation();
  }
};
