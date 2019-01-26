var AWS = require("aws-sdk");
var program = require("commander");

var local = "http://localhost:8000";
var remote = "https://dynamodb.us-east-1.amazonaws.com";

var table = "table";

var awsConfig = {
  region: "us-east-1"
};

program
  .version('0.0.1')
  .option('-e, --endpoint <dblocation>', "Db location, either local or remote")
  .option('-t, --table <table>', "Name of table to describe")
  .parse(process.argv);

if (!program.endpoint) {
  console.log("specify endpoint of either '-e local' or '-e remote'");
  process.exit(1);
}

if (!program.table) {
  console.log("enter name of the table to describe");
  process.exit(1);
}

table = program.table;

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

