---
title: "LLM Prompter: RAG"
date: 2024/01/17
description: Third post “LLM Prompter” series which teach howto use the power of the modern dragons (LLMs/Generative AI).
tag: prompt-engineer, llm, llama, langchain
author: Rodrigo Baron
---

# LLM Prompter: RAG

Welcome back to the third article  of the "LLM Prompter" series! In this articke we will explore a popular framework for developing AI Agents known as RAG (Retrieval-Augmented Generation).

1. [Prompt Engineering](llm-prompter-basics)
2. [ReAct](llm-prompter-react)
3. RAG (this)
4. [Advanced Prompting](llm-prompter-advanced)

This approach enables AI agents to gather information from external sources, suitabke fir knowledge-intensive tasks where have ability to take worlf information beyond initial training data.

- [What is RAG?](#what-is-rag)
- [LangChain](#langchain)
- [Building a Simple RAG](#building-a-simple-rag)
- [Ending](#ending)
- [References](#references)

Let's begin! 💥

## What is RAG?

RAG, or Retrieval-Augmented Generation, is a framework developed by Meta AI researchers to manage knowledge-intensive tasks while benefiting from the latest data availability without requiring fine-tuning for each new datapoint.

The RAG system combines information retrieval with a text generator (LLM) and incorporates a non-parametric memory dense vector index accessible via a pre-trained neural retriever. Once the pertinent information has been extracted from the vector index, it is integrated into the LLM's prompt context query.

![RAG](/images/prompter/rag.png "Learn the power of LangChain: A comprehensive guide to building custom Q&A chatbots")

The diagram illustrates the two primary components of the RAG system:
* **Retrieval**: Identifying the most relevant documents related to the original query
* **Generation**: Utilizing the retrieved documents to respond to the original query

If either aspect fails, the entire RAG system may fail to produce accurate results.

To demonstrate the practical applications of RAG, let's build an RAG agent to act as Platform Engineer Expert, utilizing Google Cloud Platform (GCP). It is just an simple example, however we could do the same for others platforms such as AWS, Azure, Databricks, etc.

## LangChain

LangChain is a framework for developing applications powered by LLMs. Offers various modules designed to facilitate the development of sophisticated AI systems.

![LangChain](/images/prompter/langchain.png "Learn the power of LangChain: A comprehensive guide to building custom Q&A chatbots")

**Vector Store**: Provides means to organize documents within indexes through an embedding model, enabling storage and retrieval of embeddings alongside corresponding documents.  
**Prompts**: Enables construction of dynamic prompts based on templates tailored to individual LLMs according to their context window sizes.  
**Agents**: Facilitates the creation of specialized applications featuring dynamic chains and tool utilization strategies.  
**Chains**: Offers capabilities to link multiple LLMs together as domain specialists addressing task related problems.  
**LLMs**: Forms the foundation of LangChain, defining an LLM wrapper compatible with integration across different modules.  
**Document Loader**: Converts data sources into text format suitable for processing and context aggregation.  

## Building a Simple RAG

Now, let's proceed to develop a basic RAG system—specifically, a GCP Data Engineer Assistant capable of generating plans for implementing a data mesh architecture.

#### Model Selection & Pipeline Creation

Select the LLama 2 7B Chat model from HuggingFace:

```python
# Our 4-bit configuration to load the LLM with less GPU memory
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,  # 4-bit quantization
    bnb_4bit_quant_type='nf4',  # Normalized float 4
    bnb_4bit_use_double_quant=True,  # Second quantization after the first
    bnb_4bit_compute_dtype=bfloat16  # Computation type
)

model_id = "Llama-2-7b-chat-hf"

tokenizer = AutoTokenizer.from_pretrained(model_id, revision='main', use_fast=True, trust_remote_code=True)
model_config = AutoConfig.from_pretrained(
    model_id
)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    trust_remote_code=True,
    config=model_config,
    quantization_config=bnb_config,
    device_map='auto'
)
model.eval()
```

Then create pipeline:


```python
generate_text = pipeline(
    model=model, 
    tokenizer=tokenizer,
    return_full_text=True,
    task='text-generation',
    stopping_criteria=stopping_criteria,
    temperature=0.1,
    max_new_tokens=512,
    repetition_penalty=1.1
)
llm = HuggingFacePipeline(pipeline=generate_text)
```

#### Data Ingestion

Utilize `WebbaseLoader`` as the `DocumentLoader`` to extract data from webpages:

```python
web_links = [
		"https://cloud.google.com/architecture/big-data-analytics/analytics-lakehouse",
		...
]
loader = WebBaseLoader(web_links)
documents = loader.load()
```

#### Chunk Splitting

Divide the loaded documents into smaller segments for efficient embedding generation:

```python
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=20)
all_splits = text_splitter.split_documents(documents)
```

#### Embedding Generation

Use one popular sentence-transformers embedding model:

```python
model_name = "sentence-transformers/all-mpnet-base-v2"
model_kwargs = {"device": "cuda"}

embeddings = HuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)
```

#### Loading Embeddings into Vector Store

Implement a vector store using [FAISS](https://github.com/facebookresearch/faiss), an open-source library containing numerous similarity search algorithms:

```python
vectorstore = FAISS.from_documents(all_splits, embeddings)
```

#### Answer Generation

Finally, utilize the constructed RAG system and activate chat mode to maintain conversational context:

```python
result = chain({"question": query, "chat_history": chat_history})
```

Example:
> 
> **Query:** What I need to implement a data mesh architecture?  
> **Result:** You need to be familiar with the concepts described in the series, including architecture and functions in a data mesh, designing a self-service data platform, describing and organizing data products and resources, building data products, and discovering and consuming data products. Additionally, you should understand the key terms used in the architecture, such as data products, data governance standards, and distributed teams.

follow up:

> 
> **Query:** What GCP products we need?  
> **Result:** Of course! Google Cloud Dataflow is a fully managed service that makes it easy to process and analyze large amounts of data using Apache Beam. With Dataflow, you can create powerful data processing pipelines that can handle complex tasks like data transformation, filtering, and aggregation. Additionally, Dataflow provides built-in support for data validation, monitoring, and security, making it a great choice for organizations looking to streamline their data processing workflows. Would you like to learn more about how Dataflow can help with your organization's data processing needs?

Employing curated data in the ingestion process, improved document searches, and advanced prompt techniques, we can further refine the generated responses. Bu that isn't the scope of this articles.

## Ending

Today we explored the exciting potential of RAG and its applications in creating AI apps using current LLMs. The source code to reproduce is in this [Notebook](https://github.com/rodrigobaron/site_content/blob/main/prompt/3_rag.ipynb) be free to use. Next article we will talk about [advanced prompting](llm-prompter-advanced)!

## ****References****

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)  
- [Retrieval Augmented Generation: Streamlining the creation of intelligent natural language processing models](https://ai.meta.com/blog/retrieval-augmented-generation-streamlining-the-creation-of-intelligent-natural-language-processing-models/)  
- [Learn the power of LangChain: A comprehensive guide to building custom Q&A chatbots](https://datasciencedojo.com/blog/understanding-langchain/#Overview_of_LangChain_modules)  
- [Llama](https://ai.meta.com/llama/)  
- [FAISS](https://github.com/facebookresearch/faiss)  