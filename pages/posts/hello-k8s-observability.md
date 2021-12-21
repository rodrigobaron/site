---
title: "Hello K8s: Observability"
date: 2021/12/21
description: The last post of K8s dev/lab tutorial series which we'll setup Metrics Server, Kube State Metrics, Prometheus and Grafana.
tag: tutorial, k8s, ingress
author: Rodrigo Baron
---

# Hello K8s: Observability

The last post about tutorial series of K8s dev/lab previous we [install](/posts/) and then setup the [resource management](/posts) 💪, this is the last post from the tutorial series which we'll setup [Metrics Server](#metrics-server), [Kube State Metrics](#kube-state-metrics), [Prometheus](#prometheus) and [Grafana](#grafana). The key component to ensure performance and reliability is an real-time monitoring with alerting capability, observability is one of core DevOps practices allowing granular insights to help develop good metrics and keep the system healthy. In this section we will incorporate Metrics server, Kube State Metrics, Prometheus and Grafana as the observability stack.

### Metrics server

[Metrics Server]([https://github.com/kubernetes-sigs/metrics-server](https://github.com/kubernetes-sigs/metrics-server)) collects resources metrics from Kubelets and exposes through K8s metrics api for use of [Horizontal Pod Autoscaler]([https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)) and [Vertical Pod Autoscaler]([https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler/)) making easier to debug autoscaling pipelines.

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/metrics-server/components.yaml
```

To check the deployment status:

```bash
kubectl get deployment metrics-server -n kube-system
```

### Kube State Metrics

[Kube State Metrics]([https://github.com/kubernetes/kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)) generate raw metrics about the state of the objects such deployments, nodes and pods. It aim's to display unmodified comprehensible menssages and let the users apply any time heuristics as they need. This is designed to be consumed by Prometheus however any scraper could collect the metrics from the endpoint.

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/kube-state-metrics/cluster-role-binding.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/kube-state-metrics/cluster-role.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/kube-state-metrics/deployment.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/kube-state-metrics/service-account.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/kube-state-metrics/service.yaml
```

### Prometheus

Prometheus is an monitoring and alerting tool with docker and K8s support, it can scrape metrics from nodes, containers, pods, services and user applications running in K8s cluster. 

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/prometheus/00-namespace.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/prometheus/deployment.yml
```

It expose the metrics about the prometheus it's self to a node port `30000`.

### Grafana

Is a data visualization and analytics tool which supports alerting and notification with most major time-series databases such as Prometheus and Elasticsearch. It allow us create powerful dashboards making observability easier for our cluster and applications.

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/grafana/configmap.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/grafana/deployment.yaml \
               -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/grafana/service.yaml
```

At sidebar click on `+` → `import` then search for for dashboard ID 10000

![Grafana](/images/hello-k8s-observability/grafana.png)

I told that is an old machine 😅. Also we could setup the Ingress and have a subdomain address but for simplicity let’s keep in this way.

## Conclusion

So we reach the end of the K8s setup, this is the basic setup having the resources available for more sophisticated deployments services. There will more K8s posts and this will serve as reference for have the cluster setup in an old machine. See you soon 👋

## References

- [https://github.com/kubernetes-sigs/metrics-server](https://github.com/kubernetes-sigs/metrics-server)
- [https://prometheus.io/docs/introduction/overview/](https://prometheus.io/docs/introduction/overview/)
- [https://grafana.com/oss/](https://grafana.com/oss/)