---
layout: ksql_function
name: Dialogflow
author: Mitch Seymour
tags:
    - gcp
    - dialogflow
    - chatbots
    - udf
image: https://blog.mitchseymour.com/presentations/kafka-summit-london-2019/slides/images/dialogflow.png
permalink: /luna/gcp-dialogflow/
install_id: gcp-dialogflow
source_control_link: https://github.com/magicalpipelines/ksql-functions/tree/master/udf/dialogflow
source_control_type: github
default_version: "0.1.0"
type: "udf"
versions:
    "0.1.0":
        link: "https://search.maven.org/artifact/com.mitchseymour/ksql-udf-dialogflow/0.1.0/jar"

---

The Dialogflow UDF leverages Google's Dialogflow API to respond to an inpurt string. This UDF can be used for implementing chat bots, virtual assistants, and more.

<pre>
SELECT text, dialogflow(text) FROM STREAM
</pre>
