---
title: "Anthill the Multi-Agent Framework"
date: 2024/10/22
description: Presenting Anthill 🐜 a multi-agent framework which implement OpenAI Routines and Handoffs design patterns. Additionally support many LLMs, have a build-in multi-step reasoning system, and allow developers guide and validate agent steps..
tag: agent, multi-agent, llm, anthill
author: Rodrigo Baron
---

# Anthill the Multi-Agent Framework

Introducing [Anthill 🐜](https://github.com/rodrigobaron/anthill), a multi-agent framework that implements [OpenAI Routines and Handoffs Agent orchestration](https://cookbook.openai.com/examples/orchestrating_agents) design patterns. Anthill is a fork of [OpenAI Swarm](https://github.com/openai/swarm), but unlike Swarm, Anthill supports multiple LLMs (OpenAI, Anthropic, Groq, Ollama), has an [O1](https://openai.com/o1)-like multi-step reasoning system, and allows developers to guide and validate agent steps.

![Swarm](/images/anthill-multi-agent-framework/anthill_triage_example.gif "Swarm Triage")

Article topics:
- [OpenAI Swarm](#openai-swarm)
- [Anthill Multi-Agent Framework](#anthill-multi-agent-framework)
- [Anthill Triage Example](#anthill-triage-example)
- [Anthill Triage Example with Guiding and Validations](#anthill-triage-example-with-guiding-and-validations)
- [Final Thoughts](#final-thoughts)
- [References](#references)

## OpenAI Swarm

![Swarm](/images/anthill-multi-agent-framework/swarm_diagram.png "Swarm Triage")

OpenAI released their own agentic framework, an experimental and minimal framework designed to simplify the creation of multi-agent workflows. It relies on instructions and function calling entirely on the client-side to automate complex multi-agent workflows.

Let's look at the triage example, which consists of three agents: Triage, Sales, and Refund. In this example, the Triage agent decides which is the best agent to route the user request using the tools `transfer_to_sales` and `transfer_to_refunds`. The routed agent picks up the message history and handles it, and can use tools or route back to the Triage agent using the function `transfer_back_to_triage`.

```python
...
triage_agent = Agent(
    name="Triage Agent",
    instructions="Determine which agent is best suited to handle the user's request, and transfer the conversation to that agent.",
)
sales_agent = Agent(
    name="Sales Agent",
    instructions="Be super enthusiastic about selling bees.",
)
refunds_agent = Agent(
    name="Refunds Agent",
    instructions="Help the user with a refund. If the reason is that it was too expensive, offer the user a refund code. If they insist, then process the refund.",
    functions=[process_refund, apply_discount],
)

def transfer_back_to_triage():
    """Call this function if a user is asking about a topic that is not handled by the current agent."""
    return triage_agent

def transfer_to_sales():
    return sales_agent

def transfer_to_refunds():
    return refunds_agent

triage_agent.functions = [transfer_to_sales, transfer_to_refunds]
sales_agent.functions.append(transfer_back_to_triage)
refunds_agent.functions.append(transfer_back_to_triage)
```

Unlike other multi-agent frameworks, it doesn't define execution graphs, instead allows the agent decide who handles user requests and how. This level of freedom has pros and cons.

if we try to push this to production, we'll have many sleepless nights because we can only instruct the agents, and the agents don't have any level of communication and validation to handle user requests. Also, I don't want to be stuck with one LLM provider, which is why Anthill was born.

## Anthill Multi-Agent Framework

As mentioned, Anthill is a fork of OpenAI Swarm and can handle the same examples they provided. But it has some additional features:

Anthill can use many LLM providers through the [LiteLLM](https://github.com/BerriAI/litellm) Python library, allowing use of OpenAI API Completions with many LLM providers such as Anthropic Claude models, Groq LLama 3.1 70b, OpenRouter models, locally with Ollama, and many others. This allows flexibility, though the downside is different LLMs handle the same prompt in different ways, which may require spending more time on prompt engineering to instruct the agents.

Anthill also has a multi-step thinking system at the core of all agents. This is done by adapting the [G1 experimental thinking system](https://github.com/bklieger-groq/g1) which tries to make any LLM think like OpenAI's O1 by prompting the LLM to think step by step in chat messages. Each message is a thinking step, allowing the Agent to break down the problem/task into an iterative thinking system until reaching the end or the maximum number of rounds. The agent shares its thinking when routing to another agent, enabling some level of communication and maintaining context about why it's handling the request.

The thinking system also allows agents to use tools in a way that any endpoint/API with chat support can, since the endpoint may not have function call support (OpenRouter), or doesn't have the same pattern to use functions/tools (OpenAI, Llama, Mistral).

Last but not least, Anthill can guide the agents, validate the tool calling, and reasoning path. This is done using callbacks. The main reason for callbacks is that we don't want take control of the agent, instead we want help him to correct the reasoning path, function calling, or the final decision by inject thinking steps. This way, the agent still makes the decisions but has some guidance on how to handle requests.

## Anthill Triage Example

Let's explore the same example shown above from OpenAI Swarm, the Triage system.

```python
triage_agent = Agent(
    name="Triage Agent",
    model="groq/llama-3.1-70b-versatile",
    instructions="Determine which agent is best suited to handle the user's request, and transfer the conversation to that agent. When identified a best agent to handle user request transfer right way.",
    completion_args={'temperature': 0.2}
)
sales_agent = Agent(
    name="Sales Agent",
    model="groq/llama-3.1-70b-versatile",
    instructions="Your responsability is sell bees, for others topics such as user satisfaction, refund, or others is not your responsabilities. Be super enthusiastic about selling bees.",
    completion_args={'temperature': 0.2}
)
refunds_agent = Agent(
    name="Refunds Agent",
    model="groq/llama-3.1-70b-versatile",
    instructions="Help the user with a refund. First ask the refund reason, if the reason is that it was too expensive, offer the user a refund code. If they insist, then process the refund.",
    functions=[process_refund, apply_discount],
    completion_args={'temperature': 0.2}
)

def transfer_to_triage():
    """When user a user is asking about a topic/responsability that is not handled by the current agent."""
    return triage_agent


def transfer_to_sales():
    "Transfer to sales agent."
    return sales_agent


def transfer_to_refunds():
    "Transfer to refund agent."
    return refunds_agent


triage_agent.functions = [transfer_to_sales, transfer_to_refunds]
sales_agent.functions.append(transfer_to_triage)
refunds_agent.functions.append(transfer_to_triage)
```
The first thing we notice is we're using Llama 3.1 70b from [GroqCloud](https://console.groq.com/), and the second is that we have more prompting to make the Llama model obey. We can test with simple debug prints by running `ANTHILL_DEBUG=TRUE python run.py`:

```bash
$ ANTHILL_DEBUG=TRUE python run.py 
Starting Anthill CLI 🐜
User: i want buy bees
# [2024-10-21 14:48:20] Getting chat completion for...: [{'role': 'user', 'content': 'i want buy bees'}]
# [2024-10-21 14:48:21] Step: 1 ,received completion: {'title': 'Decomposing the User Request', 'content': "The user wants to buy bees. I need to determine if this is a sales-related inquiry or if it's something else. Bees are living creatures, so this might not be a typical sales transaction. I need to consider what kind of support or information the user might need.", 'next_action': 'continue'}
# [2024-10-21 14:48:22] Step: 2 ,received completion: {'title': 'Analyzing My Responsibilities', 'content': "As a triage agent, my primary responsibility is to direct the user to the most suitable agent or resource. I don't have the capability to sell or provide living creatures. I need to identify which agent or department can assist the user with buying bees.", 'next_action': 'continue'}
# [2024-10-21 14:48:23] Step: 3 ,received completion: {'title': 'Determining the Best Course of Action', 'content': "Since the user wants to buy bees, this is likely a sales-related inquiry. However, bees are living creatures, so I need to consider if our sales team can handle this type of transaction. I'll need to transfer the conversation to the sales agent to determine the best course of action.", 'next_action': 'final_step', 'tool_name': '', 'tool_input': ''}
# [2024-10-21 14:48:25] Step: 4 ,received completion: {'title': 'Identifying the Best Agent', 'content': "Based on the user's request to buy bees, I believe the sales agent would be the most suitable to handle this inquiry. They can provide information on the availability, pricing, and logistics of purchasing bees.", 'next_action': 'final_step', 'tool_name': 'transfer_to_sales', 'tool_input': {}}
# [2024-10-21 14:48:25] Tool result name='Sales Agent' model='groq/llama-3.1-70b-versatile' instructions='Your responsability is sell bees, for others topics such as user satisfaction, refund, or others is not your responsabilities. Be super enthusiastic about selling bees.' functions=[<function transfer_to_triage at 0xffff968be980>] tool_choice=None completion_args={'temperature': 0.2}
# [2024-10-21 14:48:25] Active agent changed name='Sales Agent' model='groq/llama-3.1-70b-versatile' instructions='Your responsability is sell bees, for others topics such as user satisfaction, refund, or others is not your responsabilities. Be super enthusiastic about selling bees.' functions=[<function transfer_to_triage at 0xffff968be980>] tool_choice=None completion_args={'temperature': 0.2}
# [2024-10-21 14:48:26] Step: 5 ,received completion: {'title': "Assessing the User's Request", 'content': 'The user wants to buy bees. I need to determine what kind of bees they are looking for. Are they looking for honey bees, bumble bees, or something else? I also need to consider the quantity they want to purchase and if they have any specific requirements or questions.', 'next_action': 'continue'}
# [2024-10-21 14:48:27] Step: 6 ,received completion: {'title': "Clarifying the User's Request", 'content': 'I need to ask the user for more information about the bees they want to purchase. What type of bees are they looking for? How many do they want to buy? Do they have any specific questions or requirements?', 'next_action': 'final_step'}
# [2024-10-21 14:48:28] Response: messages=[{'role': 'assistant', 'content': 'What type of bees are you looking for? Are you looking for honey bees, bumble bees, or something else? Additionally, how many bees do you want to purchase and do you have any specific questions or requirements?', 'sender': 'Sales Agent'}] agent=Agent(name='Sales Agent', model='groq/llama-3.1-70b-versatile', instructions='Your responsability is sell bees, for others topics such as user satisfaction, refund, or others is not your responsabilities. Be super enthusiastic about selling bees.', functions=[<function transfer_to_triage at 0xffff968be980>], tool_choice=None, completion_args={'temperature': 0.2}) context_variables={}
Sales Agent: What type of bees are you looking for? Are you looking for honey bees, bumble bees, or something else? Additionally, how many bees do you want to purchase and do you have any specific questions or requirements?
```

As shown above, the request was "i want buy bees" and the agents took 6 steps. From steps 1 to 4, the **Triage Agent** took the user request, determined its responsibilities, and routed to the **Sales Agent**. In steps 5 and 6, the **Sales Agent** took the request and determined the best answer - which was asking the user to be more specific about what they want to buy.

## Anthill Triage Example with Guiding and Validations

It's also possible to guide and validate the Agent while they are thinking using callbacks. For example, we can create a callback to guide the **Triage Agent's** decision on routing the request using `before_first_thought`. We can validate function calling using `before_tool_call` and check the thinking trace using `before_last_thought`. Here's a simple example:


```python
class TriageCallback(AnthillCallback):
    @abstractmethod
    def before_first_thought(
        agent: Agent,
        history: List,
        context_variables: dict,
        model_override: str,
        execute_tools: bool,
    ) -> Optional[StepCompletionMessage]:
        if agent.name == "Triage Agent":
            if 'buy' in hystory[-1]:
                return StepCompletionMessage(
                    title="Determining the Best Agent to handle the request",
                    content="I can see the user are talking to buy, so i should consider first the Sales Agent",
                    next_action="continue"
                )
            if 'refund' in hystory[-1]:
                return StepCompletionMessage(
                    title="Determining the Best Agent to handle the request",
                    content="I can see the user are talking to buy, so i should consider first the Refund Agent",
                    next_action="continue"
                )

    @abstractmethod
    def before_tool_call(
        tool_name: str,
        tool_input: Optional[Union[dict, str]],
        agent: Agent,
        history: List,
        context_variables: dict,
        model_override: str,
        execute_tools: bool,
    ) -> Optional[StepCompletionMessage]:
        if tool_name == "process_refund" and 'item_id' not in tool_input:
            return StepCompletionMessage(
                    title="Checking for refund item id",
                    content="I can't determine the item_id input, so i should ask to user provide the item_id to make the refund.",
                    next_action="continue"
                )

    @abstractmethod
    def before_last_thought(
        last_step: StepCompletionMessage,
        step_count: int,
        agent: Agent,
        history: List,
        context_variables: dict,
        model_override: str,
        execute_tools: bool,
    ) -> Optional[StepCompletionMessage]:
        # skip thinking validation
        return None
```

## Final Thoughts

Anthill is experimental and still in development, so (of course) don't use it in production. It was fun playing with Anthill and Swarm. Check the [repo](https://github.com/rodrigobaron/anthill) and feel free to test, provide feedback or ideas. Happy hacking 😎!

## References

- [OpenAI Swarm](https://github.com/openai/swarm)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [G1](https://github.com/bklieger-groq/g1)