---
layout: ksql_function

# the author of the function
author: Mitch Seymour

# a human friendly name for your function
name: Dialogflow

# a unique id. this will be used by the upcoming luna CLI.
# e.g. luna install my-udf /path/to/ksql/ext
install_id: gcp-dialogflow

# permalink. should always be luna/<install_id>
permalink: /luna/gcp-dialogflow/

# udf or udaf
type: udf

# tags that others can use to discover your function.
# please limit to 10 tags
tags:
    - gcp
    - dialogflow
    - chatbots
    - udf

# an image to be displayed for your function. be sure to add
# this image to the /images/<install_id>/ directory
image: /images/gcp-dialogflow/dialogflow.png

# the link to your git repo
source_control_link: https://github.com/magicalpipelines/ksql-functions/tree/master/udf/dialogflow

# the type of git repo (e.g. github, bitbucket, etc)
source_control_type: github

# versions and JAR links
versions:
    0.1.0:
        link: https://search.maven.org/artifact/com.mitchseymour/ksql-udf-dialogflow/0.1.0/jar

# default version
default_version: 0.1.0


# a description of your function. feel free to use markup and html
---
The Dialogflow UDF leverages Google's Dialogflow API to respond to an inpurt string. This UDF can be used for implementing chat bots, virtual assistants, and more.

<pre>
SELECT text, dialogflow(text) FROM STREAM
</pre>