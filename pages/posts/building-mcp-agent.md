---
title: "Building MCP Agents"
date: "2025/05/07"
description: "In this article, we'll explore how to implement MCP Agents from scratch, showing how easy and powerful developing custom Agents is and extending their capability to many already available tools."
tag: "mcp", "agents", "ai"
author: "Rodrigo Baron"
---

# Building MCP Agent From Scratch

Model Context Protocol (MCP) Agents are powerful tools for automating complex workflows by providing standardized access to external data and tools. In this article, we'll explore how to implement MCP Agents from scratch, showing how easy and powerful developing custom Agents is and extending their capability to many already available tools.

![Agent MEME](/images/mcp-agent/meme.jpg "Agent MEME")

There are many Agent frameworks out there, and sure, some of them have their own special tricks, but at the end of the day, they're basically all doing the same thing. So let's break it down and build our own Agents that can connect with any MCP server, just like this:

```python
fetch = MCPServerConfig(
    command="uvx",
    args=["mcp-server-fetch"],
)

agent = MCPAgent(model=model, servers=[fetch])
await agent.execute("what is this page about: https://rodrigobaron.com ?")
```

Article topics:
- [Agents](#agents)
- [Agentic Workflow](#agentic-workflow)
- [MCP (Model Context Protocol)](#mcp-model-context-protocol)
- [Building MCP Agent](#building-mcp-agent)
- [Conclusion](#conclusion)

## Agents

AI agents are autonomous systems capable of perceiving their environment, making decisions, and taking actions to achieve specific goals. Unlike traditional AI models that simply respond to prompts, agents maintain persistent states and can execute multi-step workflows. They combine large language models with specialized tools and memory systems to handle complex tasks that require planning and adaptation.

![Agent Diagram](/images/mcp-agent/agent_diagram.svg "Agent Diagram")

Key characteristics of effective agents include goal orientation, the ability to break down problems into sub-tasks, and the capacity to learn from interactions. These systems can operate across various domains, from customer service to software development, by dynamically selecting appropriate tools and strategies based on context.

So what makes agents so special compared to your regular LLMs? It's all about that persistent state and ability to take multiple steps to solve a problem. Think of it like the difference between asking someone for directions once versus having a personal assistant who plans your entire trip, adjusts when there's traffic, and makes sure you arrive on time.

## Agentic Workflow

Agentic workflow is basically the structured process where AI agents complete tasks through sequential reasoning and action. Unlike single-step responses, agentic workflows involve planning, execution, evaluation, and iteration. The workflow begins with task understanding, where the agent analyzes requirements and constraints to formulate an approach.

The execution phase involves coordinating multiple tools and services to complete sub-tasks. Agents maintain state throughout this process, allowing them to handle interruptions, adjust strategies, and recover from errors. This dynamic capability is what distinguishes agentic systems from simpler automation tools. The workflow's effectiveness depends on robust state management.

Now, all of this sounds great in theory, but how do agents actually communicate with the outside world? Using tools - it's the bridge that connects our agents with all the data and allow they perform actions to get stuff done!

## MCP (Model Context Protocol)

Model Context Protocol (MCP) is an open standard developed by Anthropic to bridge AI assistants with external data sources and tools. It provides a standardized way for AI models to discover, connect to, and utilize external tools and context, whether querying a database, accessing files, or executing commands. MCP solves the integration challenge that previously required custom code for each data source or API.

![MCP](/images/mcp-agent/mcp.svg "MCP")

Key technical aspects of MCP include:
- **Standardized tool descriptions**: Each MCP server provides structured specifications of its capabilities
- **Two-way interactions**: Unlike simple API calls, MCP supports ongoing dialogues between agents and tools - SSE (Server Side Events)
- **Model-agnostic design**: Works with any AI model (Claude, GPT-4, open-source LLMs)
- **Open ecosystem**: Anyone can create MCP integrations

MCP is particularly valuable in agentic workflows as it provides the "plumbing" that connects an AI agent to the outside world in a secure, structured manner. It complements agent orchestration tools by serving as a unified "toolbox" from which agents can invoke external actions.

Alright, enough with the theory! Let's roll up our sleeves and actually build something. I'm going to show how to create your own MCP agent from scratch - no fancy frameworks needed, just some straightforward Python code.

## Building MCP Agent

This section provides a conceptual overview of the MCP agent implementation. The MCP agent architecture follows a component-based design where each major capability (language understanding, tool execution, state management) is handled by dedicated modules.

Key design patterns in MCP agents include:
- **Separation of Concerns**: Each component handles a specific aspect of agent functionality
- **Asynchronous Communication**: Components interact through non-blocking calls
- **State Management**: The agent maintains context across multiple steps

Let's implement an Agent from scratch, only using OpenAI client library. The Agent should be able to integrate with any MCP Server and use their tools.

### Connecting MCP with LLM's using OpenAI client

The use of OpenAI client library allows the Agent to communicate with any major LLM provider, and any popular open-source inference server. The integration between MCP and OpenAI's client is handled through the `MCPToolClient` class that serves as the bridge between them.

```python
class MCPToolClient:
    def __init__(
        self,
        model: str,
        openai_client: Optional[AsyncOpenAI] = None,
    ):
    ...
```

Seems pretty simple, right? Don't worry, there's more to it! Let's walk through how our agent will actually find and register all those fancy tools it can use.

### Tool Registration

Before execution begins, the agent must register all available MCP tools. This process involves:

1. Parsing the tool server configurations
2. Establishing connections to each MCP server
3. Generating OpenAI-compatible tool schemas

```python
connection = MCPConnectionContext(...)
            
for tool in response.tools:
      self.available_tools[tool.name] = ToolDefinition(
         name=tool.name,
         description=tool.description,
         input_schema=tool.inputSchema,
         connection=connection
      )
```

Great! Now our agent knows what tools it can use. But how does it actually use them in a single step of reasoning? Let's find out!

### Agent step

For any single agent step, the system should:

1. **Conversation Formatting**: The client prepares the message history with proper system prompts and user input.  
2. **LLM Interaction**: The client makes the API call with proper tool specifications.
3. **Tool Call Handling**: When the LLM requests a tool, the client:
   - Parses the tool call arguments
   - Routes to the appropriate MCP server
   - Processes the response

Here is the implementation snippet:

```python
messages = [
   {
      "role": "system/user/assistant/tool",
      "content": "...",
   },
]

response = await self.client.chat.completions.create(
    model=self.model,
    messages=formatted_messages,
    tools=self.tools,
    tool_choice="auto",
    max_tokens=self.max_tokens,
    temperature=self.temperature
)

tool_calls = response.choices[0].message.tool_calls or []

for tool_call in tool_calls:
   tool_name = tool_call.function.name
   args = json.loads(tool_call.function.arguments)

   tool = self.available_tools.get(tool_name)
   result = await server.execute(args)

   session = tool.connection.session
   result = await session.call_tool(tool_name, tool_args)

   yield {
      "tool_call_id": tool_call.id,
      "role": "tool",
      "name": tool_name,
      "content": json.dumps(result)
   }
```

This integration ensures seamless operation between the LLM's reasoning capabilities and MCP's tool execution framework.

Now we've got all the pieces for a single step, but an agent needs to keep going - thinking, acting, thinking again - until it solves the problem. That's where the agent loop comes in!

### Agent Loop

The `MCPAgent` class orchestrates the complex dance between LLM reasoning and tool execution through the agent loop. The agent begins by establishing all necessary connections and preparing the execution environment.

```python
class MCPAgent:
    def __init__(
      self,
      model: str,
      servers: List[MCPServerConfig],
      max_steps: int = 10
   ):
   self.servers = [server.to_stdio_parameters() for server in servers or []]
   self.tool_client = MCPToolClient(model=model, ...)
   ...
```

The main loop handles the iterative process of LLM reasoning and tool execution. Each iteration through the loop:
1. Processes the current conversation state
2. Handles LLM responses or tool executions appropriately
3. Yields results for real-time processing
4. Checks for completion conditions

```python
async def execute(self, user_input: str) -> AsyncIterator[ExecutionStep]:
    ...
    conversation.append(
        Message(role=Role.USER, content=user_input)
    )
    
    for step_num in range(self.max_steps):
        # Execute one step with current conversation state
        step_result = await self.tool_client.execute_step(conversation)
        
        # Process step
        ...
        
        yield execution_step

        # Check for completion
        if step_result.finished:
            break
```

Cool, so we've built all the plumbing! But what can we actually do with this thing? Let's put it to work on a real-world problem!

### Simple Web Research Agent

Let's test our MCP Agent doing a popular and today's core task for Agentic Systems: Web Research. The simplified version just:  

1. Fetches web page content
2. Analyzes the content
3. Extracts key information
4. Generates a summary report

The full example code should look like:

```python
import asyncio
from openai import AsyncOpenAI
from src.mcp_agent import MCPAgent, MCPServerConfig, ExecutionStep, StepType


async def main():
    playwright = MCPServerConfig(
        command="npx",
        args=["@playwright/mcp@latest"],
        env=None
    )

    query = """Search about Rodrigo Baron - Machine Learning Engineer:
1. Fetch web page content
2. Analyze the content
3. Extract key information
4. Generate a summary report
"""

    agent = MCPAgent(model=model, servers=[playwright])

    try:
        async for step in agent.execute(query):
            if not isinstance(step, ExecutionStep):
                continue

            if step.type == StepType.ASSISTANT:
                print(step.content)
            else:
                print(f"Tool Result:\n{step.content}")
    finally:
        await agent.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
```

We should expect the following logs and behavior:

```txt
[ASSISTANT]: Calling browser_navigate with arguments: {'url': 'https://www.google.com'}
[TOOL]: - Ran Playwright code
[ASSISTANT]: I am on the Google search page. I need to search ...
[ASSISTANT]: Calling browser_type with arguments: {'element': 'Pesquisar', 'submit': False, 'ref': 's1e44', 'text': 'Rodrigo Baron - Machine Learning Engineer'}
[TOOL]: - Ran Playwright code
[ASSISTANT]: I have successfully typed "Rodrigo Baron - Machine Learning Engineer" into the search bar. Now I need ...
[ASSISTANT]: Calling browser_click with arguments: {'element': 'Pesquisa Google', 'ref': 's2e87'}
[TOOL]: - Ran Playwright code
[ASSISTANT]: I have successfully searched for "Rodrigo Baron - Machine Learning Engineer" on Google...
[ASSISTANT]: Calling browser_navigate with arguments: {'url': 'https://rodrigobaron.com/'}
[TOOL]: - Ran Playwright code
[ASSISTANT]: I have navigated to Rodrigo Baron's personal website. I can see ...
[ASSISTANT]: Calling browser_navigate with arguments: {'url': 'https://www.linkedin.com/in/rodrigobaron'}
[TOOL]: - Ran Playwright code
[ASSISTANT]: I encountered a popup on LinkedIn asking me ...
Based on the information gathered:

*   **Rodrigo Baron** is a **Machine Learning Engineer** from Brazil, currently located in Toledo-PR.
*   He has over **10 years of software engineering experience** and **7 years specifically in Machine Learning Engineering**.
*   He works as an **MLOps consultant at GAVB and GB**.
*   His expertise includes building **statistical models and deep learning for computer vision**, developing **pipelines and platforms for model deployment**, and managing **data projects**.
*   He is also interested in topics like **prompt engineering and AI Agents**, as seen on his X profile.
*   His personal website and GitHub show his involvement in projects related to **optimizing, converting, and deploying machine learning models**, and building applications powered by **LLMs**.

This information provides a good overview of Rodrigo Baron's profile as a Machine Learning Engineer. I will now compile this into a summary report.

**Summary Report: Rodrigo Baron - Machine Learning Engineer**

Rodrigo Baron is a highly experienced Machine Learning Engineer based in Toledo-PR, Brazil...
```
![MCP Agent](/images/mcp-agent/mcp_client.gif "MCP Agent")

This simple MCP Agent implementation demonstrates how MCP's architecture enables:
- Seamless LLM-tool integration
- Complex multi-step workflows
- Maintainable execution patterns

Now we can extend the Agent and connect with any [available MCP servers](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file) or build one ourselves 😉. The source code is available here: [mcp-agent](http://github.com/rodrigobaron/mcp-agent)

## Conclusion

In this article, we've seen how the Model Context Protocol provides a standardized way for LLMs to interact with external tools and data sources, creating powerful AI agents that can perform complex workflows.

As MCP continues to gain adoption, we'll see an explosion of specialized tools becoming available. Whether you're building customer service bots, research assistants, or creative collaborators, this architecture provides a solid foundation for your AI agent development.

## References
- [MCP Documentation](https://modelcontextprotocol.io/)