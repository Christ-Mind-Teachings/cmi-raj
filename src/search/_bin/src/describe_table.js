var AWS = require("aws-sdk");
var program = require("commander");

var local = "http://localhost:8000";
var remote = "https://dynamodb.us-east-1.amazonaws.com";

var table = "wom2";

var awsConfig = {
  region: "us-east-1"
};

program
  .version('0.0.1')
  .option('-e, --endpoint <dblocation>', "Db location, either local or remote")
  .parse(process.argv);

if (!program.endpoint) {
  console.log("specify endpoint of either '-e local' or '-e remote'");
  process.exit(1);
}

if (program.endpoint === "remote") {
  awsConfig.endpoint = remote;
}
else {
  awsConfig.endpoint = local;
}

AWS.config.update(awsConfig);

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : table
};

dynamodb.describeTable(params, function(err, data) {
    if (err) {
        console.error("Unable to describe table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
});

