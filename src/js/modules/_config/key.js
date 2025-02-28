/*
  RAJ: Transcript keys
  - first item starts with 1, not 0
  - a numeric value that represents a specific transcript and represents
    a specific logical ordering.

  - The integer part of the key represent a transcript and the decimal part
    a paragraph within the transcript.
  - The paragraphId is increased by 1 and divided by 1000

  key format: ssbbuuu.ppp
  where: ss: source Id
         bb: book Id
        uuu: unit Id
        ppp: paragraph number - not positional

  NOTE: This module is used by code running in the browser and Node so the
        common.js module system is used
*/

//import indexOf from "lodash/indexOf";
const sprintf = require("sprintf-js").sprintf;

//source id: each source has a unique id
//WOM = 10
//JSB = 11
//ACIM = 12
//RAJ = 13
const sourceId = 13;
const sid = "raj";
const prefix = "/t/raj";


//length of pageKey excluding decimal portion
const keyLength = 7;

//Raj material books (bid)
const books = [
  "yaa", "grad", "sg2002", "sg2003", "sg2004", "sg2005", "sg2006", "sg2007", "sg2008",
  "sg2009", "sg2010", "sg2011", "sg2012", "sg2013", "sg2014", "sg2015", "sg2016",
  "sg2017", "sg2018", "acq"
];

const bookIds = ["xxx", ...books];
const acq = ["xxx", "welcome", "raj", "download"];
const grad = [
  "xxx", "g000002", "g000003", "g010491", "g010591", "g011491", "g011591", "g011691", "g011891",
  "g012091", "g012591", "g012791", "g020291", "g020591", "g020691", "g021291", "g021391", "g021491",
  "g022091", "g022591", "g030291", "g030891", "g031491", "g031991", "g032091", "g032191", "g032291",
  "g032591", "g032991"
];

const sg2002 = [
  "xxx", "061202", "073102", "080702", "081402", "082802", "090402", "091102", "091802", "092502",
  "100202", "101002", "101702", "102402", "103102", "110702", "112102", "120502", "121202", "121902"
];

const sg2003 = [
  "xxx", "010203", "010903", "011603", "012303", "020603", "021303", "022003", "022703", "030603", "031303",
  "032003", "032703", "040303", "041003", "042403", "050103", "051103", "051803", "052503", "060103", "060803",
  "061503", "062203", "062903", "070603", "071303", "072003", "072703", "080303", "081003", "081703", "082403",
  "083103", "090703", "091403", "092103", "092803", "101203", "101903", "102603", "110203", "110903", "111603",
  "112303", "120703", "121403", "122103"
];

const sg2004 = [
  "xxx", "011104", "011804", "012504", "020104", "020804", "021504", "022204", "030704", "031404", "032804",
  "040404", "041104", "041804", "042504", "050204", "050904", "051604", "052304", "053004", "061304", "062004",
  "062704", "071104", "071804", "072504", "080104", "080804", "081504", "082204", "090504", "091204", "091904",
  "092604", "100304", "101004", "101704", "102404", "110704", "112104", "112804", "120504", "121204", "121904"
];

const sg2005 = [
  "xxx", "010205", "011605", "012305", "013005", "021305", "022005", "030605", "031305", "032705", "040305",
  "041005", "041705", "042405", "050105", "050805", "052205", "060505", "061205", "061905", "070305", "071005",
  "071705", "072405", "080705", "081405", "082105", "082805", "090405", "091105", "091805", "100205", "100905",
  "101605", "102305", "110605", "111305", "112005", "120405", "121105", "121805"
];

const sg2006 = [
  "xxx", "010806", "011506", "012206", "012906", "021206", "022606", "030406", "031106", "031906", "040106",
  "041506", "042906", "050606", "052006", "052706", "060306", "061006", "061806", "062406", "070106", "071506",
  "073006", "080506", "081206", "082006", "090206", "090906", "092306", "100706", "101406", "102106", "102806",
  "111106", "111806", "120206"
];

const sg2007 = [
  "xxx", "081807", "082507", "090907", "091607", "092207", "100607", "101407", "102707", "110307", "111007",
  "111807", "120807", "121607"
];

const sg2008 = [
  "xxx", "012008", "012708", "021008", "021708", "022408", "030208", "030908", "032508", "033008", "040608",
  "041308", "042008", "050408", "051808", "052508", "060108", "060808", "061508", "062208", "070608", "071308",
  "072708", "081708", "083108", "090708", "091408", "092108", "100508", "101908", "102608", "110208", "110908",
  "112308"
];

const sg2009 = [
  "xxx", "010309", "011009", "011709", "012409", "020709", "022809", "031409", "032809", "040409", "041209",
  "042509", "050909", "052409", "053109", "060709", "061309", "062009", "071109", "071809", "072509", "080109",
  "080809", "082909", "090509", "091209", "091909", "092709", "101009", "102409", "103109", "111409", "112209",
  "112809", "120509", "121909"
];

const sg2010 = [
  "xxx", "010210", "011610", "013010", "020610", "021310", "030610", "032010", "032710", "040310", "041010",
  "050110", "051510", "052910", "060510", "061210", "061910", "070310", "071010", "071710", "072410", "080710",
  "082810", "090410", "091110", "092510", "100210", "100910", "101610", "102310", "110610", "111310", "112010",
  "112710", "120410", "121810"
];

const sg2011 = [
  "xxx", "010111", "010811", "011511", "012211", "020511", "021611", "021911", "031211", "032011", "032611",
  "040311", "040911", "041611", "042311", "043011", "050711", "051411", "052211", "060411", "061211", "061811",
  "062611", "070911", "071611", "073011", "080611", "082011", "082711", "090311", "091711", "092411", "100111",
  "101511", "102311", "110511", "111311", "112611", "120411", "121111", "122011"
];

const sg2012 = [
  "xxx", "010712", "012212", "020512", "021212", "021812", "032412", "033112", "040812", "041512", "042212",
  "042912", "051212", "052012", "060312", "061712", "072212", "072912", "080412", "081112", "081812",
  "082712", "090812", "091612", "092312", "093012", "100812", "101412", "102112", "110512", "111212"
];

const sg2013 = [
  "xxx", "042713", "050413", "051113", "052013", "052813", "060213", "060913", "062513", "063013", "070713",
  "071413", "072113", "080413", "081113", "082513", "090113", "090813", "091513", "092313", "100613", "101513",
  "102013", "102713", "110313", "112413", "122213", "123013"
];

const sg2014 = [
  "xxx", "010614", "011414", "012814", "020914", "022414", "030914", "041314", "061614", "062914", "091514"
];

const sg2015 = [
  "xxx", "041815", "042515", "050315", "050915", "051715", "060715", "061415", "062115", "062815", "070515",
  "071315", "072115", "080115", "082315", "091315", "100215", "102115", "110115"
];

const sg2016 = [
  "xxx", "070316", "071616", "080216"
];

const sg2017 = [
  "xxx", "040817", "041617", "042317", "043017", "051217", "060917", "071117", "072317", "092317", "100117",
  "101717", "120417"
];

const sg2018 = [
  "xxx", "013118", "031118", "081918", "082918"
];

const yaa = [
  "xxx", "acknowledgments", "foreword", "020782", "020882", "020982", "021082", "021182a", "021182b", "021282",
  "021382", "021482", "021682", "021782", "021882a", "021882b", "021882c", "021982", "022082", "022182a", "022182b",
  "022382a", "022382b", "022382c", "022482", "022582", "022682a", "022682b", "022682c", "022782", "022882", "030182a",
  "030182b", "030282", "030382", "030482a", "030482b", "030582a", "030582b", "030682a", "030682b", "030682c",
  "030682d", "030682e", "030882", "030982", "031082a", "031082b", "031082c", "031182", "031382", "031582", "031982",
  "032982", "033082", "042782", "042882", "042982", "043082", "050182", "050282", "050382", "050782", "050982",
  "051082a", "051082b", "051082c", "051182", "051582", "051782", "052882", "053082", "060382", "061082", "061282",
  "061482", "061982", "062182", "afterword"
];

const contents = {
  acq: acq,
  yaa: yaa,
  grad: grad,
  sg2002: sg2002,
  sg2003: sg2003,
  sg2004: sg2004,
  sg2005: sg2005,
  sg2006: sg2006,
  sg2007: sg2007,
  sg2008: sg2008,
  sg2009: sg2009,
  sg2010: sg2010,
  sg2011: sg2011,
  sg2012: sg2012,
  sg2013: sg2013,
  sg2014: sg2014,
  sg2015: sg2015,
  sg2016: sg2016,
  sg2017: sg2017,
  sg2018: sg2018
};

function splitUrl(url) {
  let u = url;

  //remove leading "/"
  u = url.substr(1);

  //remove trailing '/' if it exists
  if (u[u.length-1] === "/") {
    u = u.substr(0, u.length - 1);
  }

  return u.split("/");
}

/*
  return the position of unit in the bid array
*/
function getUnitId(bid, unit) {
  if (contents[bid]) {
    return contents[bid].indexOf(unit);
  }
  else {
    throw new Error(`unexpected bookId: ${bid}`);
  }
}

function getSourceId() {
  return sourceId;
}

function getKeyInfo() {
  return {
    sourceId: sourceId,
    keyLength: keyLength
  };
}

/*
  parse bookmarkId into pageKey and paragraphId
  - pid=0 indicates no paragraph id
*/
function parseKey(key) {
  const keyInfo = getKeyInfo();
  let keyString = key;
  let pid = 0;

  if (typeof keyString === "number") {
    keyString = key.toString(10);
  }

  let decimalPos = keyString.indexOf(".");

  //if no decimal key doesn't include paragraph id
  if (decimalPos > -1) {
    let decimalPart = keyString.substr(decimalPos + 1);

    //append 0's if decimal part < 3
    switch(decimalPart.length) {
      case 1:
        decimalPart = `${decimalPart}00`;
        break;
      case 2:
        decimalPart = `${decimalPart}0`;
        break;
    }
    pid = parseInt(decimalPart, 10);
  }
  let pageKey = parseInt(keyString.substr(0, keyInfo.keyLength), 10);

  return {pid, pageKey};
}

/*
  Convert url into key
  returns -1 for non-transcript url

  key format: ssbuuIqq.ppp
  where: ss: source Id
         bb: book Id
        uuu: unit Id
        ppp: paragraph number - not positional
*/
function genPageKey(url = location.pathname) {
  let key = {
    sid: sourceId,
    bid: 0,
    uid: 0,
    qid: 0
  };

  let parts = splitUrl(url);

  //key.bid = indexOf(bookIds, parts[0]);
  key.bid = bookIds.indexOf(parts[2]);
  if (key.bid === -1) {
    return -1;
  }
  key.uid = getUnitId(parts[2], parts[3]);
  if (key.bid === -1) {
    return -1;
  }

  let compositeKey = sprintf("%02s%02s%03s", key.sid, key.bid, key.uid);
  let numericKey = parseInt(compositeKey, 10);

  return numericKey;
}

/*
  genParagraphKey(paragraphId, key: url || pageKey)

  args:
    pid: a string representing a transcript paragraph, starts as "p0"..."pnnn"
         - it's converted to number and incremented by 1 then divided by 1000
        pid can also be a number so then we just increment it and divide by 1000

    key: either a url or pageKey returned from genPageKey(), if key
   is a string it is assumed to be a url
*/
function genParagraphKey(pid, key = location.pathname) {
  let numericKey = key;
  let pKey;

  if (typeof pid === "string") {
    pKey = (parseInt(pid.substr(1), 10) + 1) / 1000;
  }
  else {
    pKey = (pid + 1)/1000;
  }

  //if key is a string it represents a url
  if (typeof key === "string") {
    numericKey = genPageKey(key);
  }

  let paragraphKey = numericKey + pKey;

  return paragraphKey;
}

/*
  key format: ssbuuIqq.ppp
  where: ss: source Id
         bb: book Id
        uuu: unit Id
        ppp: paragraph number - not positional
*/
function decodeKey(key) {
  let {pid, pageKey} = parseKey(key);
  let pageKeyString = pageKey.toString(10);
  let decodedKey = {
    error: 0,
    message: "ok",
    sid: sourceId,
    bookId: "",
    uid: 0,
    pid: pid - 1
  };

  //error, invalid key length
  if (pageKeyString.length !== keyLength) {
    decodedKey.error = true;
    decodedKey.message = `Integer portion of key should have a length of ${keyLength}, key is: ${pageKeyString}`;
    return decodedKey;
  }

  let bid = parseInt(pageKeyString.substr(2,2), 10);
  decodedKey.bookId = bookIds[bid];

  //subtract 1 from key value to get index
  decodedKey.uid = parseInt(pageKeyString.substr(4,3), 10) - 1;

  return decodedKey;
}

function getBooks() {
  return books;
}

/*
  Return the number of chapters in the book (bid).
  Subtract one from length because of 'xxx' (fake chapter)
*/
function getNumberOfUnits(bid) {
  if (contents[bid]) {
    return contents[bid].length - 1;
  }
  else {
    throw new Error(`getNumberOfUnits() unexpected bookId: ${bid}`);
  }
}

/*
 * Convert page key to url
 */
function getUrl(key, withPrefix = false) {
  let decodedKey = decodeKey(key, false);
  let unit = "invalid";

  if (decodedKey.error) {
    return "/invalid/key/";
  }

  if (contents[decodedKey.bookId]) {
    unit = contents[decodedKey.bookId][decodedKey.uid + 1];
  }

  if (withPrefix) {
    return `${prefix}/${decodedKey.bookId}/${unit}/`;
  }
  else {
    return `/${decodedKey.bookId}/${unit}/`;
  }
}

/*
 * Convert page key to url
function getUrl(key) {
  let decodedKey = decodeKey(key);
  let unit = "invalid";

  if (decodedKey.error) {
    return "/invalid/key/";
  }

  if (contents[decodedKey.bookId]) {
    unit = contents[decodedKey.bookId][decodedKey.uid + 1];
  }

  return `/${decodedKey.bookId}/${unit}/`;
}
 */

/*
  Describe key in terms of source:book:unit:p
*/
function describeKey(key) {
  let decodedKey = decodeKey(key, false);

  if (decodedKey.error) {
    return {key: key, error: true, source: sid};
  }

  let info = {
    key: key,
    source: sid,
    book: decodedKey.bookId,
    unit: contents[decodedKey.bookId][decodedKey.uid + 1]
  };

  if (decodedKey.pid > -1) {
    info.pid = `p${decodedKey.pid}`;
  }

  return info;
}

module.exports = {
  getNumberOfUnits: getNumberOfUnits,
  getBooks: getBooks,
  getUrl: getUrl,
  getSourceId: getSourceId,
  getKeyInfo: getKeyInfo,
  parseKey: parseKey,
  getUnitId: getUnitId,
  genPageKey: genPageKey,
  genParagraphKey: genParagraphKey,
  decodeKey: decodeKey,
  describeKey: describeKey
};

