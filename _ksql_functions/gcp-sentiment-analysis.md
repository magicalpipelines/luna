---
layout: post
name: Sentiment Analysis
author: Mitch Seymour
tags:
    - gcp
    - sentiment
    - nlp
    - udf
image: https://blog.mitchseymour.com/presentations/kafka-summit-london-2019/slides/images/google-cloud-logo.png
permalink: /gcp-sentiment-analysis/
install_id: gcp-sentiment-analysis
source_control_link: "https://github.com/magicalpipelines/ksql-functions/tree/master/udf/sentiment-analysis"
source_control_type: github
default_version: "v0.2.0"
type: "udf"
versions:
    "0.2.0":
        link: "https://search.maven.org/artifact/com.mitchseymour/ksql-udf-sentiment-analysis/0.2.0/jar"
    "0.1.0":
        link: "https://search.maven.org/artifact/com.mitchseymour/ksql-udf-sentiment-analysis/0.1.0/jar"

---

The sentiment analysis UDF leverages Google's Natural Language API to determine the emotional sentiment
from a string of text.

<pre>
SELECT text, sentiment(text) FROM STREAM
</pre>