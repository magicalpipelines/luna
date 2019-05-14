# Luna
Luna is a community for sharing KSQL functions. It is brand new and therefore relatively small at the moment. Please feel 
free to contribute your own KSQL functions so that we can grow this community. If your function has broad use cases and 
you feel that it should be a default KSQL function, submit it to [confluentinc/ksql][confluent-ksql] instead.

__Note:__ Luna will soon include a CLI component that will leverage the data located in this repo to make
installing functions easier. The planned syntax for the CLI is:

```bash
luna install some-udf /path/to/ksql/ext
```

[confluent-hub]: https://www.confluent.io/hub/
[confluent-ksql]: https://github.com/confluentinc/ksql

# Sharing your function
- Upload your JAR to Maven Central
- Copy the [template](template.yaml) to the `_ksql_functions` directory
  ```bash
  cp template.md _ksql_functions/my-udf.md
  ```
- Fill out the required fields and add a markdown description of your function.
  ```yaml
  ---
  layout: ksql_function

  # the author of the function
  author: Jane Smith

  # a human friendly name for your function
  name: My UDF

  # a unique id. this will be used by the upcoming luna CLI.
  # e.g. luna install my-udf /path/to/ksql/ext
  install_id: my-udf
  
  ...
  
  ---
  This UDF is so magical.

  <pre>
  SELECT magic_function(col) FROM SOME STREAM ;
  </pre>
  ```
  - Open a PR
  - Once your PR is merged, you should see your function appear within a couple of minutes at https://magicalpipelines.com/luna
