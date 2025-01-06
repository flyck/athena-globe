/// <reference path="./.sst/platform/config.d.ts" />
import * as pulumi from "@pulumi/pulumi";
import * as awsP from "@pulumi/aws";

export default $config({
    app(input) {
        return {
            name: "athena-globe",
            removal: input?.stage === "production" ? "retain" : "remove",
            protect: ["production"].includes(input?.stage),
            home: "aws",
        };
    },
    async run() {
        // pulumi code
        const bucket = new awsP.s3.BucketV2("athena-globe-felix", {
          forceDestroy: true, // We require this in the example as we are not managing the contents of the bucket via Pulumi
      });
      

        const athena = new awsP.athena.Database("athena-globe-db",
          { name: "athena_globe",
             bucket: bucket.bucket, forceDestroy: true },
        );

        function createTableQuery(bucket: string) {
          return `CREATE EXTERNAL TABLE athena_globe_json(
  name string,
  longitude double, 
  latitude double)
ROW FORMAT SERDE
  'org.openx.data.jsonserde.JsonSerDe'
STORED AS INPUTFORMAT
  'org.apache.hadoop.mapred.TextInputFormat'
OUTPUTFORMAT
  'org.apache.hadoop.hive.ql.io.IgnoreKeyTextOutputFormat'
LOCATION
  's3://${bucket}/'`
        }
        const createTableAthenaQuery = new awsP.athena.NamedQuery(
          "createTable", { database: athena.id, query: bucket.bucket.apply(createTableQuery)});

    },
});
