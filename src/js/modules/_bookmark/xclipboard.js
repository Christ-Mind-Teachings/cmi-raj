import Clipboard from "clipboard";
import notify from "toastr";

var clipboard;

function setEvents(clip) {
  clip.on("success", (e) => {
    notify.info("Link Copied to Clipboard");
    e.clearSelection();
  });

  clip.on("error", () => {notify.info("Error coping to Clipboard");});
}

function createInstance(selector) {
  var object = new Clipboard(selector);
  setEvents(object);
  return object;
}

export default {
  register: function(selector) {
    if (!clipboard) {
      clipboard = createInstance(selector);
    }
    return clipboard;
  },
  destroy: function() {
    if (clipboard) {
      clipboard.destroy();
    }
  }
};
