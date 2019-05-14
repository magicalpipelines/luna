---
layout: ksql_function

# the author of the function
author: Mitch Seymour

# a human friendly name for your function
name: Sentiment Analysis

# a unique id. this will be used by the upcoming luna CLI.
# e.g. luna install my-udf /path/to/ksql/ext
install_id: gcp-sentiment-analysis

# permalink. should always be luna/<install_id>
permalink: /luna/gcp-sentiment-analysis/

# udf or udaf
type: udf

# tags that others can use to discover your function.
# please limit to 10 tags
tags:
    - gcp
    - sentiment
    - nlp
    - natural language processing
    - udf

# an image to be displayed for your function. be sure to add
# this image to the /images/<install_id>/ directory
image: /images/gcp-sentiment-analysis/google-cloud-logo.png

# the link to your git repo
source_control_link: https://github.com/magicalpipelines/ksql-functions/tree/master/udf/sentiment-analysis

# the type of git repo (e.g. github, bitbucket, etc)
source_control_type: github

# versions and JAR links
versions:
    0.2.0:
        link: https://search.maven.org/artifact/com.mitchseymour/ksql-udf-sentiment-analysis/0.2.0/jar
    0.1.0:
        link: https://search.maven.org/artifact/com.mitchseymour/ksql-udf-sentiment-analysis/0.1.0/jar

# default version
default_version: 0.2.0


# a description of your function. feel free to use markup and html
---
The sentiment analysis UDF leverages Google's Natural Language API to determine the emotional sentiment
from a string of text.

<pre>
SELECT text, sentiment(text) FROM STREAM
</pre>
