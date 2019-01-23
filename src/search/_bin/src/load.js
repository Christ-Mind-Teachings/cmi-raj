var AWS = require("aws-sdk");
var fs = require('fs');
var program = require("commander");
const key = require("../../../js/modules/_config/key");

var local = "http://localhost:8000";
var remote = "https://dynamodb.us-east-1.amazonaws.com";

var table = "wom2";

var awsConfig = {
  region: "us-east-1"
};

program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-e, --endpoint <dblocation>', "Db location, either local or remote")
  .option('-v, --verify', 'Verify input files but don\'t load')
  .parse(process.argv);

if (!program.directory && program.args.length == 0) {
  console.log("No input files specified");
  process.exit(1);
}

if (!program.endpoint) {
  console.log("specify endpoint of either 'local' or 'remote'");
  process.exit(1);
}

if (program.endpoint === "remote") {
  awsConfig.endpoint = remote;
}
else {
  awsConfig.endpoint = local;
}

AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();

program.args.forEach(function(fn) {
  if (fn.indexOf(".json") === -1) {
    fn = fn + ".json";
  }
  load(table, fn, program.verify?true:false);
});

function load(table, fileName, verify) {
  var discarded = 0;

  if (verify) {
    console.log("Verifying: %s", fileName);
  }

  let data = JSON.parse(fs.readFileSync(fileName, 'utf8'));

  if (verify) {
    return;
  }

  let url = `/${data.book}/${data.unit}/`;
  let pageKey = key.genPageKey(url);

  data.paragraph.forEach((p) => {
    discarded += loadParagraph(pageKey, p, data.book, data.unit, fileName);
  });

  let fne = fileName.substr(fileName.lastIndexOf("/") + 1);
  let fn = fne.substr(0, fne.length - 5);
  console.log("+%s:%s:%s:%s", fn, pageKey, data.paragraph.length, discarded);
}

function loadParagraph(pageKey, p, book, unit, fn) {
  let discard = p.discard ? p.discard : 0;
  let paraKey = key.genParagraphKey(p.pid, pageKey);

  let params = {
      TableName: table,
      Item: {
          "parakey": paraKey.toString(10),
          "book": book,
          "unit": unit,
          "pid":  p.pid,
          "text": p.text
      }
  };

  //we discard one line paragraphs that are often repeated
  if (discard === 1) {
    return 1;
  }
  else {
    docClient.put(params, function(err) {
      if (err) {
        console.log("error:%s:%s", params.Item.parakey, fn);
      }
      else {
        console.log("ok: %s", params.Item.parakey);
      }
    });

    return 0;
  }
}


