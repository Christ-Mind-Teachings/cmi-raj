
import _findLastIndex from "lodash/findLastIndex";

export default class CaptureData {

  constructor(base) {
    this.data = {base: base, time: []};
    this.player = null;
  }

  setPlayer(player) {
    this.player = player;
  }

  setData(o) {
    this.data = o;
  }

  //called when we already have timing data
  setTimeArray(a) {
    this.data.time = a;
  }

  add(o) {
    this.data.time.push(o);
    return this.data.time.length;
  }

  remove(o) {
    let pos = _findLastIndex(this.data.time, {id: o.id});

    if (pos === -1) {
      return -1;
    }
    else {
      this.data.time.splice(pos, 1);
      return this.data.time.length;
    }
  }

  length() {
    return this.data.time.length;
  }

  getData() {
    return this.data;
  }
}


