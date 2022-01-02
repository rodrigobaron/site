---
title: "Hello K8s: Installation"
date: 2021/12/09
description: The first post of a series of three to setup kubernetes local lab/dev using Ubuntu Server 20.04 as master and node.
tag: tutorial, k8s, ubuntu, docker
author: Rodrigo Baron
---

# Hello K8s: installation

This is the first post of a series of three to setup a kubernetes (in short K8s) local lab using Ubuntu server 20.04 as master and node. Regarding the Linux distribution chosen the main idea is an cluster where we can easily setup (and break), for that Ubuntu is a very popular Linux distribution and most people are comfortable to use. Production environment would recommend using an container optimized distribution like [RancherOS]([https://rancher.com/docs/os/v1.x/en/](https://rancher.com/docs/os/v1.x/en/)).  

This is written more to myself but hope others can benefit as well. As already said this will be composed by a series of posts which aim to be educative rather production-ready deployments, suitable for development environments and container based labs like mine own. So since this is the first post in the blog page I would like to provide the most important lesson I've learned (in the hard way): we should assume we don't know everything and actually we don't need to know to start play with it, we learn by doing and having fun in the path. It apply to everything you want learn/develop not just this topic... I hope you have fun 🙂.

### Kubernetes

I can't start an K8s tutorial without saying what it is.. so i'll be brief and point the main idea and the core components behind. Besides this is an short explanation If you already know about K8s would be better to skip to [setup](#setup) section. In this section we'll know a bit about why this exists and when to use. 

In short K8s is an platform to manage workloads and services distributed as container initially developed by Google which in 2014 was open sourced and become a Linux Foundation project. The platform provide an way to manage distributed systems resiliently in the form of declarative state, in the other words it have mechanisms to handle the fail-over and keep the declarated cluster state. Actually is much more than that but these features along with deployment strategies, observability principles and the extensibility nature makes attractive to many real world applications challenges. 

The following is the main components behind K8s and know their existence forehand would be easier to understand the deployments:

**Node:** Can be a virtual or physical machine responsible to run our workloads in pods.

**Pod:** Are the smallest deployable unit of computing. It contains one or more application containers.

**API Server:** The interaction point for all others components and uses, it delegates state to a backend (etcd).

**Kubelet:** The agent living the nodes which communicate with API server and report the host's container runtime status.

**Controller Manager:** Handle many k8s object to match the desired states.

**Scheduler:** Determines where workloads run based on node scoring.

**Kube Proxy:** Services implementation providing pods virtual IPs.

So as noticed this can be a bit complex and that is the time to talk "when we should use K8s". Basically if your application is currently easier to manage there no motive to add complex things to it, when your application start become more complex to manage and maintain K8s could be an option to lower down the complexity to the median level. What I'm saying is K8s make easier applications into complex applications and very complex application to just complex 😅

## Setup

As mentioned before I'm using the Ubuntu Server 20.04 and assuming you have it installed without additional modules other than open-ssh, in the minimal way possible. I'll not cover the installation procedure since is straightforward and have plenty of tutorials. 

### Docker Setup

First of all we need an container runtime with CRI interface support to able be orchestrated by K8s. The most popular is **Docker**.. of course.. which K8s communicate through kubelet component called dockershim, basically a gRPC server which implements CRI and make possible communicate with Docker Engine. Also have alternatives to consider such as **containerd**: the most common container runtime in managed Kubernetes clouds (AKS, EKS and GKE) implementing the CRI interface by an plug-in; and **CRI-O**: container runtime specifically designed for K8s, basically just implement the CRI interface.

I'll use docker because my labs often use nvidia-docker to build experiments, feel free to setup any other container runtime but if your choice is docker then should processed with the installation as follows:

```bash
sudo apt update -y && sudo apt install -y \
	curl \
	gnupg2 \
	software-properties-common \
	apt-transport-https \
	ca-certificates
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update -y && sudo apt install -y \
	containerd.io \
	docker-ce \
	docker-ce-cli
```

After the install we can use docker commands but only with elevated privilegies which is not good, to enable user to run docker commands:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

Now just need restart docker and enable the service:

```bash
sudo systemctl restart docker
sudo systemctl enable docker
```

 We need do logout and login again to use the new group permission setup.

### Kubernetes Setup

Before proceed with k8s installation we must disable the swap (if you have it setup):

```bash
sudo sed -e '/\/swap.img/ s/^#*/#/' -i /etc/fstab
sudo swapoff -a
sudo rm /swap.img
```

Also would be good configure an hostname, something like this in `/etc/hosts`:

```bash
127.0.0.1 localhost
...
192.168.0.222 k8s.rodrigobaron.com
```

The next step is install kubelet, kubeadm and kubectl:

```bash
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update -y && sudo apt install -y \
	wget \
	kubelet \
	kubeadm \
	kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

Then configure docker to use systemd cgroup, if we don't do that you could see this error `kubeadm init will fail because of either kubelet is not healthy or kubelet is not running` in the cluster initialization. Actually lets also setup the log and storage options:

```bash
sudo tee /etc/docker/daemon.json <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF
```

And of course again restart docker to apply the configuration:

```bash
sudo systemctl daemon-reload 
sudo systemctl restart docker
```

Enable kubelet and pull the config images:

```bash
sudo systemctl enable kubelet
sudo kubeadm config images pull
```

Initializing cluster:

```bash

sudo kubeadm init \
  --cri-socket=/var/run/dockershim.sock \
  --pod-network-cidr=172.29.0.0/16 \
  --upload-certs \
  --control-plane-endpoint=k8s.rodrigobaron.com
```

Setup our cluster as default kube-config:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### Calico

Every pod should have an IP address and be able to connect to every pod in every node, also we should be able manage their connectivity and have a fine grained security polices. To make this possible we should Install an network plugin and for this case we've chosen Calico, an open source complete networking and network security solution. To proceed the installation:

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/calico/deployment.yaml
```

The primary modification is make `cidr` match with kubeadm initialization flag `--pod-network-cidr=172.29.0.0/16` to match with our initialization:

```yaml
cidr: 172.29.0.0/16
```

### Add Work Node

In this section we will add a node to our cluster but before that let's verify if the master node is ready run `kubectl get nodes -o wide`, should see:

```bash
NAME   STATUS   ROLES                  AGE   VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION     CONTAINER-RUNTIME
k8s    Ready    control-plane,master   12m   v1.23.0   192.168.0.222   <none>        Ubuntu 20.04.3 LTS   5.4.0-91-generic   docker://20.10.11
```

After confirm the master node is ready we can create an token to allow join nodes using the print join command:

```bash
kubeadm token create --print-join-command
```

The node installation is the same as the master util the `kubeadm init` command, instead running `kubeadm init` we run the output of join command:

```bash
kubeadm join k8s.rodrigobaron.com:6443 --token umf2rg.rnf80e5q3hr6nfu2 --discovery-token-ca-cert-hash sha256:a3e257d51c95ee6faf3e70b149dbb387c75579a7f776b46cec0153782308f3d3
```

One important thing to consider is the master node never run workloads, so if you wanna allow master scheduling pods (NOT RECOMMEND) just the command below replacing the `$SERVERNAME` with name output of `kubectl get nodes`command:

```bash
kubectl taint nodes $SERVERNAME node-role.kubernetes.io/master-
```

### MetalLB load-balancer

K8s doesn't offer a out of box network load balancer for bare-metal clusters, if you are outside of the popular IaaS plaforms such as GCP, AWS, Azure.. your service of type LoadBalancer will remain in "pending" state forever. MetalLB is one network load balancer implementation to overcome this situation. Before the installation we should edit kube-proxy configmap by running `kubectl edit configmap -n kube-system kube-proxy` to match with:

```bash
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
ipvs:
  strictARP: true
```

Then proceed the installation:

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/metallb/namespace.yaml
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/metallb/metallb.yaml
```

## cert-manager

To complete base network section would be good have an certificate management and I've choice [cert-manager]([https://cert-manager.io/](https://cert-manager.io/)) which adds certificates and certificate issuers as resource types such as [Let’s Encrypt]([https://letsencrypt.org/](https://letsencrypt.org/)) and [HashiCorp Vault]([https://www.vaultproject.io/](https://www.vaultproject.io/)). The basic installation:

```bash
kubectl create -f https://raw.githubusercontent.com/rodrigobaron/manifests/main/cert-manager/deployment.yaml
```

### Next steps

We reached the end of first post where we covered the installation and the setup of basic network components.Next post we will see about [resource management](/posts/hello-k8s-resource-management).

## References

- [https://kubernetes.io/docs/concepts/](https://kubernetes.io/docs/concepts/)
- [https://kubernetes.io/docs/setup/production-environment/container-runtimes/](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)
- [https://docs.projectcalico.org/about/about-calico](https://docs.projectcalico.org/about/about-calico)
- [https://rancher.com/docs/os/v1.x/en/](https://rancher.com/docs/os/v1.x/en/)
- [https://metallb.universe.tf/installation/](https://metallb.universe.tf/installation/) [https://metallb.universe.tf/configuration/](https://metallb.universe.tf/configuration/)
- [https://cert-manager.io/docs/](https://cert-manager.io/docs/)
