---
title: "Machine Learning Project in 2020s"
date: 2022/03/20
description: The first non-technical post where I point out some issues when trying to implement a machine learning project.
tag: machine-learning, project-management
author: Rodrigo Baron
---

# Machine Learning Project in 2020s
Hey there! In this post, I'm gonna share some challenges I faced while working on a machine learning project. I'm not gonna explain what machine learning is or why it's important - I'm assuming you already know that stuff (or can look it up on your own, as homework assignment 😛).

## Managers Often Don’t Understand Data Science

It might sound harsh, but managers often overlook two super important parts of machine learning projects: data and experimentation. It's like they think ML is some kind of magic trick - just hire some ML magicians, tell them what you want, and boom, you've got yourself a fancy new AI system. But that's not how it works, and managers often end up in situations like these:  
* They don't analyze data requirements (like, do we even have the right data? Is there enough of it? Do we need to label it?).
* They don't set a value metric (like, is 95% accuracy actually good? Is this metric even related to our goal?).
* They set a deadline with some random "good" number in mind (like, make a model that's 95% accurate in three months).
* They expect a fully automated "AI" solution (like, a system that can sell houses without any human help at all).  

Let me break it down for you:  

**Data** - Just because you have a big database doesn't mean you've "got data" for your project. There might not be any relevant info, or you might need to label the data or get a domain expert to connect the dots between the data and the goal.  

**Experimentation** - Experimentation is the heart of any science project. It can show good, bad, or "interesting" results. Unlike regular software planning, experiment development isn't the same as regular software development - you can't always predict what's gonna happen.  

## Project Management and Tooling

It's natural to try and fit ML projects into regular software project management and tooling. I mean, we've got all these tools and best practices for software development, so why not use it? Plus, at the end of the day, we're still delivering software, right? Well, mostly. But the "piece" called data is actually more important than the software itself.  

Most project managers (PMs) are cool with agile practices and frameworks like [Scrum](https://www.scrum.org/resources/what-is-scrum), so it's tempting to just use those methods for ML projects. But here's the thing: Scrum was made for regular software projects, not ML projects. The main reason is the experimental nature of ML. So, instead of forcing experiments into a timebox, I recommend using [ScrumBut](https://www.scrum.org/resources/what-scrumbut) for ML projects.  

The ML tooling scene is wild, with tons of tools and new ones popping up all the time. Don't waste your time trying to understand every single one. Just use the simplest tool that gets the job done. And you don't need Kubernetes for ML - only use it if you already have a Kubernetes cluster or if all the tools you choose work well with the same version of Kubernetes (which is unlikely).

## The Machine Learning Lifecycle

ML projects don't have an incremental step with small changes and shippable units like regular software projects do. For a while, they might seem like regular software development, but then one incremental development might take way longer than the previous five. That's because ML projects have an experimental design, which doesn't mean they're wrong, but rather that they might not be optimal. The real problem is on the management side.  

Here's a typical ML project lifecycle:  

![Outerbounds - Machine learning pipelines: from prototype to production](/images/machine-learning-project-in-2020s/common-ml.png "Outerbounds - Machine learning pipelines: from prototype to production")

At the macro level, one experiment iteration includes developing and testing on both development and production data. You want to make sure the model performs similarly in both worlds, even if it degrades a bit in production. If you only deploy at the end of the project, you risk not delivering the value you wanted and missing mistakes made during development.  

## Best Practices

There's no one "right" way to manage and develop ML projects, but we can use our experiences and the community's to create best practices and avoid common issues. Here are some best practices for an ML project:  

1. **Data and goal understanding** - Do a basic analysis of the available data and the goal, so you can plan the minimal requirements. Clearly define the goal (like, maximize the number of active clients to increase market dominance, but don't get distracted by total income).  

1. **Metric development** - Create metrics that represent the goal value for which the models will be optimized. Also, develop metrics that make it easier to compare experiments.  

1. **Infrastructure** - Get the infrastructure set up (or almost set up) before the first experiment development. Make model development and deployment iterations as fast as possible.  

1. **Simple models first** - Start with simple models as a baseline, which are easier to understand, then iterate to more complex ones.

1. **Test everything** - Test infrastructure, data, code, and deployments.  

1. **Monitoring** - Monitor your models in production and compare their metrics over time and over environments.  

1. **Research** - Once you have a good model established, try to build more complex solutions by looking at the machine learning research community or conducting your own research and development.

## Ending

I tried to keep it short as possible. If you have any questions or want to chat more about this, hit me up on social media, email, or in this [GitHub Issue](https://github.com/rodrigobaron/site/issues/13). I'll update this post if I missed anything important. 👋

## References

- [Machine learning pipelines: from prototype to production](https://outerbounds.com/blog/machine-learning-pipelines-from-prototype-to-production/)
- [Rules of Machine Learning: Best Practices for ML Engineering](https://martin.zinkevich.org/rules_of_ml/rules_of_ml.pdf)