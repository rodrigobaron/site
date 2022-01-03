---
title: "Quick-Deploy"
date: 2022/01/02
description: Announcing the first release of Quick-Deploy a tools to optimize, convert and deploy machine learning models as fast inference API.
tag: quick-deploy, transformers, sklearn, mlops
author: Rodrigo Baron
---

# Quick-Deploy

I’m happy to announce the first release of [Quick-Deploy](https://github.com/rodrigobaron/quick-deploy), one of my OSS projects which was be working on spare time for some months. Quick-Deploy provide tools to optimize, convert and deploy machine learning models as fast inference API (low latency and high throughput) by [Triton Inference Server](https://github.com/triton-inference-server/server) using [Onnx Runtime](https://github.com/microsoft/onnxruntime) backend. It support 🤗 transformers, PyToch, Tensorflow, SKLearn and XGBoost models.

I had the idea to build a tool which optimize and deploy any kind of machine learning model, the announcement of [Infinity](https://huggingface.co/infinity) gave more energy to keep building the tool and after [Benesty](https://towardsdatascience.com/hugging-face-transformer-inference-under-1-millisecond-latency-e1be0057a51c) post gave even more fuel.

In the future releases of Quick-Deploy may have (or not) support for many others backends and serving platforms however the focus now is the ability to easily move machine learning models to high performance production API. This blog post aim to demonstrate how to install Quick-Deploy and deploy some toy models walking trough the process and available features.

## Install

Before diving into install process we have think how we can use it.. there an [docker container](https://hub.docker.com/r/rodrigobaron/quick-deploy/tags) available for the full version (the others are coming soon) and a python library `quick-deploy`. Wait what? full version?? That’s right, there a full version which have the dependencies to handle all models deployment however we should use a minimal version to handle the target model only. In production environment is important to kept just the used libraries, less code less errors 😜.

For example if we have a SKLearn model trained and we just need deploy that model then could install the correspondent version by:

```bash
$ pip install quick-deploy[sklearn]
```

Now since we are aware of this for this post we use the full version 😅 since we will have more than one target model library:

```bash
$ pip install quick-deploy[full]
```

## Transformers

The first example let’s deploy a bert model using 🤗 [transformers](https://github.com/huggingface/transformers). Quick-Deploy have integration with transformers we can use a path of pretrained model or use the 🤗 Hub directly, in this example we just point the model we wanna deploy directly from Hub and let the tools do the work for us.

In this example we will deploy `bert-base-uncased` to `Fill Masks` in a sentence and deploy it to a `GPU` inference server, after install we just need run:

```bash
$ quick-deploy transformers \
    -n my-bert-base \
    -p fill-mask \
    -m bert-base-uncased \
    -o ./models \
    --model-type bert \
    --seq-len 128 \
    --cuda
```

It automagically convert, apply `bert` specifict optmizations then convert weights to `int8` and finally save as ORT graph model `my-bert-base` into `./models` to handle `sequence length of 128`. Now the next step is run Triton Inference Server and point our model artifact to it:

```bash
$ docker run -it --rm \
    --gpus all \
    -p 8000:8000 \
    -p 8001:8001 \
    -p 8002:8002 \
    --shm-size 256m \
    -v $PWD/models:/models \
    nvcr.io/nvidia/tritonserver:21.11-py3 tritonserver --model-repository=/models
```

This boot the Triton Inference Server and load our model serving the gRPC endpoint to 8000 port now we just need consume the model. Before write the client we need know that only server the model itself and not the tokenizer and post-processing steps, the full transformers serving is in the road-map 😉. The client uses the `tritonclient` library to make the calls in the right format:

```python
import numpy as np
import tritonclient.http
from scipy.special import softmax
from transformers import BertModel, BertTokenizer, TensorType

def topK(x, k, axis=0):
    idx = np.argpartition(x, -k)[:, -k:]
    indices = idx[:, np.argsort((-x)[:, idx][0])][0]
    return indices

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

model_name = "my_bert_base"
url = "127.0.0.1:8000"
model_version = "1"
batch_size = 1

text = "The goal of life is [MASK]."
tokens = tokenizer(text=text, return_tensors=TensorType.NUMPY)

triton_client = tritonclient.http.InferenceServerClient(url=url, verbose=False)
assert triton_client.is_model_ready(
    model_name=model_name, model_version=model_version
), f"model {model_name} not yet ready"

input_ids = tritonclient.http.InferInput(name="input_ids", shape=(batch_size, 9), datatype="INT64")
token_type_ids = tritonclient.http.InferInput(name="token_type_ids", shape=(batch_size, 9), datatype="INT64")
attention = tritonclient.http.InferInput(name="attention_mask", shape=(batch_size, 9), datatype="INT64")
model_output = tritonclient.http.InferRequestedOutput(name="output", binary_data=False)

input_ids.set_data_from_numpy(tokens['input_ids'] * batch_size)
token_type_ids.set_data_from_numpy(tokens['token_type_ids'] * batch_size)
attention.set_data_from_numpy(tokens['attention_mask'] * batch_size)

response = triton_client.infer(
    model_name=model_name,
    model_version=model_version,
    inputs=[input_ids, token_type_ids, attention],
    outputs=[model_output],
)

token_logits = response.as_numpy("output")
mask_token_index = np.where(tokens['input_ids'] == tokenizer.mask_token_id)[1]
mask_token_logits = token_logits[0, mask_token_index, :]
mask_token_logits = softmax(mask_token_logits, axis=1)

top_5_indices = topK(mask_token_logits, 5, axis=1)
top_5_values = mask_token_logits[:, top_5_indices][0]

top_5_tokens = zip(top_5_indices[0].tolist(), top_5_values[0].tolist())

for token, score in top_5_tokens:
    print(text.replace(tokenizer.mask_token, tokenizer.decode([token])), f"(score: {score})")
```

After running the client we need get this result for the input `"The goal of life is [MASK]."`:

```
The goal of life is life. (score: 0.04277362674474716)
The goal of life is survival. (score: 0.016944246366620064)
The goal of life is simple. (score: 0.013943460769951344)
The goal of life is education. (score: 0.012822331860661507)
The goal of life is freedom. (score: 0.012810023501515388)
```

## SKLearn

The second and last example in this post is serving the classical Iris classification model, we will train an `RandomForestClassifier` and deploy it. So the lets do the training:

```python
import pickle

from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y)
clr = RandomForestClassifier()
clr.fit(X_train, y_train)
clr.predict_proba = None

with open("iris_cls.bin", "wb") as p_file:
    pickle.dump(clr, p_file)
```

Now we have a trained model unlike transformers model we don’t know anything about the model inputs and output, so we need provide a configuration YAML with that information:

```yaml
kind: IOSchema
inputs:
  - name: input
    dtype: float32
    shape: [4]
outputs:
  - name: label
    shape: [-1]
    dtype: int64
  - name: probabilities
    shape: [-1, 3]
    dtype: float32
```

Now let’s use Quick-Deploy to generate the artifact:

```python
$ quick-deploy sklearn \
    -n iris_cls \
    -m iris_cls.bin \
    -o ./models \
    -f iris_cls.yaml
```

Basically we are creating the artifact `iris_cls` inside of `./models` folder for the trained model `iris_cls.bin` using the input and output specification `iris_cls.yaml`. Next step is boot the inference server again:

```bash
$ docker run -it --rm \
    --gpus all \
    -p 8000:8000 \
    -p 8001:8001 \
    -p 8002:8002 \
    --shm-size 256m \
    -v $PWD/models:/models \
    nvcr.io/nvidia/tritonserver:21.11-py3 tritonserver --model-repository=/models
```

Then use the client consumer, same as before but for this specific model:

```python
import numpy as np
import tritonclient.http
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

iris = load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y)

model_name = "iris_cls"
url = "127.0.0.1:8000"
model_version = "1"
batch_size = 1

triton_client = tritonclient.http.InferenceServerClient(url=url, verbose=False)
assert triton_client.is_model_ready(
    model_name=model_name, model_version=model_version
), f"model {model_name} not yet ready"

model_input = tritonclient.http.InferInput(name="input", shape=(batch_size, 4), datatype="FP32")
model_label = tritonclient.http.InferRequestedOutput(name="label", binary_data=False)
model_proba = tritonclient.http.InferRequestedOutput(name="probabilities", binary_data=False)

model_input.set_data_from_numpy(np.array([X_test[0]]).astype(np.float32))
response = triton_client.infer(
    model_name=model_name, model_version=model_version, inputs=[model_input], outputs=[model_label, model_proba]
)

output1 = response.as_numpy("label")
output2 = response.as_numpy("probabilities")
print(output1)
print(output2)
```

For more examples and use cases please check the [examples](https://github.com/rodrigobaron/quick-deploy/tree/main/examples) in project repository.

## Ending

So I hope you enjoy the [project](https://github.com/rodrigobaron/quick-deploy) and it can be useful for you, I see it as an awesome tool to engineers and scientists have in their workflow speeding up the proof of concept and production machine learning models deployment. Feel free to reach me or the project for more details or contributions, happy hacking 🙂.