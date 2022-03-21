---
title: "Machine Learning Project in 2020s"
date: 2022/03/20
description: The first non-technical post where I point out some issues when trying to implement a machine learning project.
tag: machine-learning, project-management
author: Rodrigo Baron
---

# Machine Learning Project in 2020s

The first non-technical post where I point out some issues when trying to implement a machine learning project. I refuse to give an introduction to what machine learning (ML) is and how important it is for a company, so this part is for homework 😛.

## Managers Don’t Understand Data Science

This might sounds unfair, but surprisingly managers forget two most important pieces of machine learning project: Data and Experimentation. Actually seems they look at ML as a kind of magic, just hire ML magicians and tell them what you want and when.. they often put themselves in this kind of situation:

- They plan to develop an ML project without any data requirements analysis (eg, do we have relevant data? is it enough? do we need to label it?);
- They have an plan without value metric (eg, it’s 95% accuracy valuable? The metric is really related to reaching the goal?);
- They set the deadline with a metric that they think is a “good number” without any reference (eg, you have 3 months to develop a model that achieves 95% accuracy);
- The solution is an fully automated “AI” (eg, the system should sell houses without any humman intervention or assistency).

So for context..

**Data** - you can have a database with millions rows but that doens’t mean you “have data” for your project.. maybe there’s no relavant information or maybe you need label it or have some domain expert as integral time to connect the understanding about the data and the objective.

**experiment** - is the heart of any science project it can show good, bad or “interesting” result. So unlike an regular software planning, experiment developing is not same as a regular software developing where is most of cases know that will works.

## Project Management and Tooling

Trying fit ML projects into regular software project management and tooling this is natural choice since along the years we developed tools and best practices for software development, so just reuse what we know. Also make sense because at end we are delivering software isn’t? Yes in the most part is software, however the “piece” called data is more important than the software.

Most cases project managers (PM’s) are confortable with agile practices and frameworks like [Scrum](https://www.scrum.org/resources/what-is-scrum) so why not just use it? Yes we can but need keep in mind Scrum was made for regular software project so it doens’t fit completely for an ML project and the main reason is the **experiment** nature. So put an **experiment** into a deliverable timebox doens’t make any sense, however I still believe in the use of Scrum for ML projects, more specifically [ScrumBut](https://www.scrum.org/resources/what-scrumbut).

The ML tooling right now is so overwhelming, there are so many tools and if you spend time to understand one of them two more were born around that time, so don’t spend so much effort just try use the simplest tool you found. Also, you don’t need Kubernetes for ML, from my perspective use it if you already have a Kubernetes cluster or if all the tools you choose work fine on the same version of Kubernetes (good luck with that).

## The Machine Learning Lifecycle

Again, unlike regular software projects, ML projects don’t have an incremental step composed of small changes with shipable units. Actually for some period of time they will works such an regular software develop which makes the feel of working project management, however at some point one incremental development will take longer than the previous five. This is caused by the experiment design,which does not mean that the design of the experiment is wrong, it may not be optimal, but the main problem still the management side.

So if look an common ML project lifecycle as illustrated in the figure bellow, it’s separated in green what typically an data scientist do and in blue what a machine learning engineer do, many project just follow these steps and the last step is the end of the project. That’s a huge mistake, we should test the experiments on production data (as soon as possible).. so that we could use offline production data or use some deployment strategy for experimentation.

![Outerbounds - Machine learning pipelines: from prototype to production](/images/machine-learning-project-in-2020s/common-ml.png "Outerbounds - Machine learning pipelines: from prototype to production")

At the macro level, that is just one experiment iteration, we should consider development data and production data as two worlds and make sure the model perform close as possible in both worlds, expecting some performance degradation. If we deploy once at end of project we run the risk of not delivering the desired value and missing the mistakes made in development data.

## Best Practices

There’s no right way of manage and develop ML projects, however we can use our experiences and those of the community to develop best practices and avoid common issues. So this is my list of best practices for an ML project:

1. **Data and goal understanding** — Here we must make a basic analysis of the available data and what is the goal, so it’s possible to plan the minimal requirements. Must define an clear goal, as an example, see the table below:

    | # Experiment | # Nº of active clients / month | # Total income / month  |
    | --- | --- | --- |
    | Exp. A | 5,000 | $ 200,000.00 |
    | Exp. B | 10,000 | $ 100,000.00 |

    Which experiment we should take? What’s the goal? For instance maybe the goal is maxmize the number of active clients to increase market dominance but get distracted by total income, of course we should consider total income but what’s the goal?

2. **Metric development** — Once have data and an clear goal, must develop metrics that represent the goal value for which the models will be optimized. Also develop metrics which make easier to compare experiments.
3. **Infrastructure** — Get infrastructure done (or almost done) before first experiment development. Make model development and deployment iteration as fast as possible.
4. **Simple models first** — Prefer most of the time (not always) to develop simple models first as baseline which is easier to understand, then iterate to complex ones.
5. **Test everything** — Test infrastructure: make sure the infrastrucure is right; Test data: clean data give better results than model design; Test code: unit testing and integration testing; Test deployments: A/B testing and so.
6. **Monitoring** — Monitor you models in production and compare their metrics over time and over environments.
7. **Research** — Once have a good model established, try whenever possible build more complex solutions by looking at the machine learning research community or make your own research development.

## Ending

I’ve tried to summarize much as possible keeping just the main points so you can always reach me over the social networks, mail or in this [github issue](https://github.com/rodrigobaron/site/issues/13) to discuss more about this topic. I’ll update this in case of missed any other important point 👋.

## References

- [Machine learning pipelines: from prototype to production](https://outerbounds.com/blog/machine-learning-pipelines-from-prototype-to-production/)
- [Rules of Machine Learning: Best Practices for ML Engineering](https://martin.zinkevich.org/rules_of_ml/rules_of_ml.pdf)