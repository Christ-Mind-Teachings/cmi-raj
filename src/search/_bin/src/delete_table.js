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
  .option('-t, --table <table>', "Name of table to delete")
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

dynamodb.deleteTable(params, function(err, data) {
    if (err) {
        console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
