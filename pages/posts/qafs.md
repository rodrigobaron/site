---
title: "QAFS - Quality Aware Feature Store"
date: 2022/01/26
description: Just released QAFS another machine learning engineering tool to help build and maintain ML products.
tag: qafs, feature-store, data-quality, mlops
author: Rodrigo Baron
---

# QAFS - Quality Aware Feature Store

Just released [QAFS](https://github.com/rodrigobaron/qafs) another machine learning engineering tool to help build and maintain ML products. Building machine learning models are becoming easier every year.. doing `.fit` on a toy dataset and see the metrics is great however when we move to production side the fun is ~~almost~~ over. How do I know the [metrics are not killing our company?](https://www.reddit.com/r/MachineLearning/comments/qlilnf/n_zillows_nnbased_zestimate_leads_to_massive/) and what about [potentially doing bad recommendations for four months?](https://engineering.atspotify.com/2021/11/15/the-rise-and-lessons-learned-of-ml-models-to-personalize-content-on-home-part-i/) Actually I do not know, but we can try minimize the risks using Feature Store + Data Quality Checks + Monitoring stack.  

The main idea is the ML teams keep the data pipelines simple and be able to scale, for this reason `QAFS` was build to use an existing infraestructure e.g., run on a local machine and scale to [Dask](https://dask.org/) or [Spark](https://spark.apache.org/) (not supported yet) cluster.

## Feature Store

Using the same features at training and serving time is far the main advantage of an feature store, in this way we know the models are consuming the same features as they are trained. Others caracteristics are sharing features acros projects/teams, feature versioning, query and process data by datetime and metadata tagging.

![Feature Store Overview](/images/qafs/FeatureStoreOverview.png "Feature Store Overview (mlops-guide)")

[Feast](https://feast.dev/) is a popular Feature Store however deploying and maitain Feast could be painful. For more details about the [feature store concept](https://feast.dev/blog/what-is-a-feature-store/).  

## Data Quality Check

Code bugs are harder to find and fix until you see data bugs then the "hard" definition will be in another level. Code testing and documentation is an standard software engineer task in any project but an ML project is basically code + data which make engineers life even harder to put these projects in production. The concept of "data is correct" change over time depending of the application some validation done yesterday can be invalid for tomorrow's data, btw a interesting paper [Pervasive Label Errors in Test Sets Destabilize Machine Learning Benchmarks](https://arxiv.org/abs/2103.14749) shows that bad data can effectively reduce model capacity by 3 times (if you like papers 😉).  

So **QAFS** couple the feature store and data quality checks concepts by integrating [pandera](https://pandera.readthedocs.io/) an dataframe validation library when registering features. In this way we can easily build and extend the data validations  to any kind e.g., perform data distribuition check (data/model drift).

## Install

Installing the python package through pip:  

```bash
$ pip install qafs
```

Bellow is an example of usage **qafs** where we'll create a feature store and register `numbers` feature and an `squared` feature transformation. First we need import the packages and create the feature store, for this example we are using sqlite database and persisting the features in the filesystem:  

```python
import qafs
import pandas as pd
import pandera as pa
from pandera import Check, Column, DataFrameSchema
from pandera import io


fs = qafs.FeatureStore(
    connection_string='sqlite:///test.sqlite',
    url='/tmp/featurestore/example'
)
```

Features could be stored in namespaces, it help organize the data. When creating `numbers` we specify the `example/numbers` feature to point the feature `numbers`at that namespace `example` however we can use the arguments `name='numbers', namespace='example'` as well. Then we must specify the data validation using **pandera**, in this case the feature is `Integer` and the values should be `greater than 0`:

```python
fs.create_namespace('example', description='Example datasets')
fs.create_feature(
    'example/numbers',
    description='Timeseries of numbers',
    check=Column(pa.Int, Check.greater_than(0))
)


dts = pd.date_range('2020-01-01', '2021-02-09')
df = pd.DataFrame({'time': dts, 'numbers': list(range(1, len(dts) + 1))})

fs.save_dataframe(df, name='numbers', namespace='example')

```

To register our `squared` transformation feature we're using the annotation `fs.transform` and fetching the data from the `numbers` feature applying the same data validation from `numbers`:
```python
@fs.transform(
    'example/squared',
    from_features=['example/numbers'],
    check=Column(pa.Int, Check.greater_than(0))
)
def squared(df):
    return df ** 2

```

When fetch our features we should see:
```python
df_query = fs.load_dataframe(
    ['example/numbers', 'example/squared'], 
    from_date='2021-01-01',
    to_date='2021-01-31'
)
print(df_query.tail(1))
##----
#             example/numbers  example/squared
# time                                        
# 2021-01-31              397           157609
##----
```

## Monitoring

At training time doing data validation checks can lead to a breaking pipeline so we can stop and carefully think about the data but at serving time this will end up into a broken application. **QAFS** have the ability to log the data validations errors and avoid applications breaks, for that we must set the environment variable `QAFS_RAISE_ERROR=false` which make use of `logging.error` where an existing application monitoring stack excel in tasks such log grouping, filtering.. build reports and send notifications.  

## Ending

Remembering this is an beta release and hope making **QAFS** a stable tool, check the [github page](https://github.com/rodrigobaron/qafs) and open an issue for questions or features you would like to see implemented 👊
