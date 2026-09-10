---
title: Agentic Development Is Expensive
description: AI can write more software than ever. The next optimisation problem might be knowing when not to use it.
pubDate: 'Sep 10 2026'
heroImage: '/src/assets/images/blog/the-value-of-boredom.png'
theme: '#767329'
categories:
    - "ai"
    - "development"
    - "vibe-coding"
cta: "Using AI in your development process and need help making it sustainable? Let's talk."
---

I'm currently building an AI application and I've run into a problem I wasn't really expecting.

I'm not sure how I'm going to afford to run it.

Not at scale. Not after attracting thousands of users.

**While I'm developing it.**

The application uses external AI inference, and development and testing consume that inference. Change something, run it, inspect the result, change something else, run it again.

At the same time, I'm using AI to develop the application itself.

So I'm paying for AI to help me build software that spends money on AI while I test the software the AI just built.

Welcome to agentic development.

## I've actually had to stop developing

I've found myself sitting on my hands waiting for usage limits to reset.

That's annoying when it's my project and my time.

Commercially, it's terrifying.

Imagine running a development team and discovering at two in the afternoon that productivity has fallen off a cliff because you've exhausted an AI allowance.

Or worse, development continues perfectly happily while agents burn through metered third-party services in the background.

We've spent decades worrying about developer utilisation.

Now we potentially have developers capable of producing an extraordinary amount of work who occasionally need to be told:

**Stop developing. It's costing too much money.**

## There isn't one AI bill

One thing that's become obvious is that AI development can consume compute at several different points.

There's the AI I use to think about the problem.

There's Codex doing the implementation.

There's the inference used by the application itself.

There might be another model evaluating the output.

There might be several providers involved.

Then there are retries, tests, experiments and failed approaches.

The cost of AI isn't just the subscription visible on an expenses report.

It's becoming embedded in the development process.

**Tokens are the new cloud bill.**

And just like cloud infrastructure, each individual decision can look almost free.

It's the accumulation that's frightening.

## The agent doesn't care about your Hugging Face bill

This is where I've hit another problem.

Codex is very good at working towards an outcome.

But it can make its own decisions about how it gets there.

That's sort of the point.

Give an agent a problem and we increasingly want it to inspect the codebase, make changes, run the application, test the result, investigate failures and iterate.

That's incredibly powerful.

But the agent is primarily optimising for **task completion**.

It isn't necessarily optimising for the economics of the entire system.

If hitting an inference endpoint repeatedly is the easiest way to establish whether its implementation works, that's a perfectly rational technical decision.

Financially, it might be a terrible one.

A test isn't necessarily free anymore.

A retry isn't necessarily free.

An exploratory implementation isn't necessarily free.

An agent can consume its own allowance while simultaneously causing the application it's developing to consume another allowance somewhere else.

We're building agents that can indirectly make spending decisions without necessarily understanding that they're making spending decisions.

## The budget is part of the architecture

I've traditionally thought about architectural constraints in technical terms.

State lives here.

Authentication belongs there.

Business logic doesn't belong in the view.

This layer can talk to that layer.

I'm now adding another kind:

**This operation costs money.**

If a particular route invokes paid inference, that's not just information for whoever pays the invoice.

It affects how the application should be built and tested.

If running a test suite can accidentally make 500 paid inference calls, cost is a property of the architecture.

If a retry strategy can turn one failed request into ten paid requests, cost is a property of the architecture.

If a coding agent can repeatedly invoke an expensive model while trying to fix an unrelated UI problem, cost is a property of the architecture.

An AI application needs a **financial architecture** as much as it needs a technical one.

## Think cheaply. Execute expensively.

I've naturally started separating the thinking from the implementation.

I do a lot of the theory in a conversational interface.

We discuss the problem.

Challenge the architecture.

Work through the unknowns.

Decide what actually needs changing.

Then I turn that thinking into a bounded prompt for the coding agent.

Codex gets something much closer to:

**Here is the problem. Here is the relevant context. Here are the constraints. Here is what success looks like. Don't change anything else.**

Rather than:

**Have a look at this and work out what we should do.**

I'm not convinced my exact workflow is how everyone works, but I increasingly think the principle matters.

A highly capable coding agent is an expensive place to discover what you actually want to build.

**Think cheaply. Execute expensively.**

Use the expensive capability when you have an expensive problem for it to solve.

## The repository is part of the prompt

I've also started thinking differently about the repository itself.

I'm currently working on an application where the architecture is actually quite simple once you understand it.

Authored state lives in one place.

Physical actions are resolved somewhere else.

AI interprets input in another layer.

Conversation generation has its own responsibility.

Sequencing lives somewhere else again.

Codex can discover all of this.

It can search the repository, read the files, trace imports and reconstruct the architecture every time I ask it to do something.

But why am I paying it to rediscover something I already know?

So I've started putting the map in the repository.

Not documentation of every function.

Not an enormous technical manual that's out of date by next Tuesday.

Just the stable architectural truths.

This is where state lives.

These are the files that matter for this type of change.

This layer owns this behaviour.

This thing must never happen.

This external service is metered.

**Don't pay an agent repeatedly to infer your architecture. Tell it your architecture.**

## Context isn't free

This makes repository instructions like `AGENTS.md` much more interesting to me.

They're not just developer documentation.

They're part of the agentic development environment.

We've spent years trying to give human developers more context.

Understand the client.

Understand the architecture.

Read the documentation.

Know why previous decisions were made.

That's generally good advice.

With AI, context can literally have a price.

An agent repeatedly rediscovering the architecture consumes resources.

An agent reading irrelevant parts of a repository consumes resources.

An agent exploring three possible approaches when the team already decided which one to use consumes resources.

So give it the useful context early.

Where things live.

How the application works.

Which commands matter.

What not to touch.

What decisions have already been made.

And increasingly:

**What costs money.**

The cheapest token is the one you never needed to send.

## But don't build a documentation machine

There's an obvious trap here.

If every Codex task becomes:

Build the feature.

Run the tests.

Review the architecture.

Update `AGENTS.md`.

Update the documentation.

Summarise what you learnt.

Check whether the documentation needs restructuring.

We've created meta-work in an attempt to eliminate meta-work.

That costs inference too.

I don't think `AGENTS.md` should become a cache of everything an agent has ever learnt about the project.

It should contain **stable truths, not a diary**.

If responsibility moves between architectural layers, update it.

If a new invariant appears, update it.

If a paid dependency is introduced, update it.

If the agent keeps making the same mistake because an important constraint isn't documented, update it.

If you've changed the padding on a card, leave it alone.

Documentation has an inference cost as well.

## Make the agent make fewer decisions

This might be the principle underneath most of this.

Agentic development is exciting precisely because agents can make decisions.

We shouldn't remove that autonomy.

But there's little value in paying a model to make decisions the team has already made.

A good task increasingly looks like:

**known architecture + bounded problem + relevant context + constraints + acceptance criteria + economic constraints**

The agent still has plenty to work out.

It just doesn't have to rediscover the entire project before it starts.

**Agentic optimisation is largely the business of making the agent make fewer unnecessary decisions.**

Save its intelligence for the decisions where intelligence actually adds value.

## Don't test the button with a GPU

A large proportion of an AI application's behaviour doesn't actually require AI to test.

Does the button work?

Does the request contain the correct data?

Does state persist?

Does the response render?

Does the route work?

Does an error display correctly?

Does the application call the correct service?

None of those necessarily require live inference.

Yet it's very easy during development to wire everything together and repeatedly exercise the whole stack.

That means every frontend adjustment can potentially trigger an expensive backend operation.

I'd increasingly separate AI applications into three development modes.

**Mock mode**

Predictable, deterministic responses. Cheap enough to use constantly.

**Integration mode**

Real infrastructure where necessary, using cheaper inference or tightly controlled calls.

**Production inference**

The models and configuration that actually determine product quality.

The expensive model should be answering questions that genuinely require the expensive model.

Not helping you establish whether a modal closes.

## Deterministic tests become even more valuable

This gives conventional software engineering a rather satisfying comeback.

Types.

Unit tests.

Fixtures.

Mocks.

Linting.

Static analysis.

Build checks.

Contract tests.

They're boring.

They're also incredibly cheap compared with repeatedly asking an intelligent agent to inspect whether something still works.

Agentic development doesn't make traditional engineering discipline obsolete.

It arguably makes it more valuable.

**Don't spend intelligence proving something a deterministic test can prove.**

## Agents need financial guardrails

Cost constraints also need to become explicit instructions.

If Hugging Face inference is metered, the agent should know.

If an API costs money every time it's called, the agent should know.

If one model is significantly more expensive than another, the agent should know.

If live inference should only happen deliberately, the agent should definitely know.

Something as simple as this can become part of the repository:

```md
## Cost-sensitive development

External AI inference is metered and must be treated as a paid resource.

- Do not call live inference during routine development or testing.
- Use mocks or recorded fixtures wherever possible.
- Do not introduce or switch paid providers without approval.
- Do not create uncontrolled retry loops against metered APIs.
- Explain before running tests that invoke paid inference.
- Use the cheapest suitable model for development testing.
- Keep live inference tests narrow and intentional.
```

That's not really a coding standard.

It's **financial governance for agents**.

The agent should know the technical budget before it gets implementation freedom.

## Put a price on uncertainty

There's another lesson here that connects with how I've always approached estimating development.

If you don't know how to solve something, don't pretend you do.

Buy some certainty.

Prototype it.

Investigate it.

Prove the risky part.

Then estimate the implementation with better information.

AI gives us another resource we can explicitly allocate to that process.

Instead of casually burning inference throughout development, perhaps a project should deliberately allocate an inference budget to discovery.

Spend £50 proving whether the difficult bit works.

That's useful expenditure.

Spend £50 because an agent repeatedly ran an expensive integration while adjusting some CSS and you've learnt nothing.

**Inference needs to become a project resource.**

## The cost per token isn't really the point

There's a lot of discussion about AI getting cheaper.

It probably will.

Models become more efficient. Hardware improves. Competition drives prices down.

But I'm not convinced that's going to solve this problem in the short term.

Because as the models become more capable, we're asking them to do considerably more.

The assistant that once completed a function now reads a repository.

It changes several files.

Runs the build.

Starts the application.

Inspects the result.

Reads the error.

Searches the codebase.

Changes its approach.

Runs everything again.

Maybe it opens a browser.

Maybe it calls another AI.

So the important number isn't necessarily the cost of one token.

**The cost per unit of intelligence can fall while the amount of intelligence we consume explodes.**

The AI arms race is currently producing astonishing capability.

I'm less convinced that it's producing predictable development economics.

## What happens when the AI disappears?

There's another problem that concerns me more than the bill.

Developers are getting extremely productive with AI.

That's fantastic.

I'm one of them.

But we're already reaching a point where some developers are working on codebases that have substantially been created by agents.

And I've already seen the beginnings of another problem: developers who are extremely productive with AI but considerably less useful without it.

That's especially concerning when AI has built enough of the project that the developer no longer has a strong mental model of how it works.

What happens when their allowance runs out?

What happens when the organisation changes provider?

What happens when the model is deprecated?

What happens when the developer who knew how to coax the agent through the project leaves?

If you didn't write the system, don't understand the system and can't continue developing the system without access to the thing that wrote it, you've created a dependency.

And dependencies need managing.

## Shadow AI can become shadow infrastructure

This gets particularly worrying inside agencies and larger organisations.

Shadow AI is usually discussed as a security and governance problem.

Someone copies client data into an unsanctioned model.

Someone uses a personal AI account for company work.

Those are legitimate concerns.

But there's another one.

Imagine a developer quietly using their own Claude subscription, Codex allowance, Hugging Face credits or another inference provider to deliver a project.

They're incredibly productive.

The estimate works.

The deadline is hit.

Everyone's delighted.

Then they leave.

Suddenly nobody knows that part of the project's apparent commercial viability was being subsidised by a developer's personal AI stack.

Or the provider changes its pricing.

Or procurement blocks it.

Or the model disappears.

Or the application scales and somebody finally discovers what each user actually costs.

**Shadow AI can become shadow infrastructure.**

That's not just a governance problem.

It's technical and commercial debt.

## Measure the cost of a useful interaction

AI products also need a slightly different attitude towards hosting costs.

With a conventional website, I can usually get a reasonable idea of what infrastructure will cost.

With an AI application, I increasingly want to know:

**What does one useful interaction cost?**

Then:

How many interactions make a session?

How many sessions does a user have?

How many users can the product support?

Suddenly the unit economics start becoming visible.

That might determine whether the product can be free.

Whether it needs subscriptions.

Whether users need allowances.

Whether inference needs caching.

Whether a smaller model is good enough.

Whether some operations should happen locally.

Whether the product is commercially viable at all.

Those questions shouldn't arrive after launch.

I'm discovering that they need to be part of development.

## Agentic development needs a budget

I think this is the broader lesson I'm taking from all of this.

We've been concentrating on what AI agents **can** do.

The next question is how much autonomy we can economically afford to give them.

A useful agent needs technical constraints.

Don't change this API.

Don't modify the schema.

Follow this architecture.

Run these tests.

But it increasingly needs economic constraints as well.

Don't call that service unnecessarily.

Don't use the expensive model for this.

Don't retry indefinitely.

Don't run live inference without asking.

Don't spend £10 proving something a unit test could establish for nothing.

The budget isn't something we check after the technical decisions have been made.

**The budget is one of the technical constraints.**

## Optimise the whole system

So my rules for agentic development are starting to look something like this:

1. **Think cheaply, execute expensively.** Work out what you actually want before unleashing the coding agent.

2. **Give agents bounded tasks.** Smaller surfaces mean less context, less exploration and fewer opportunities to wander.

3. **Design the repository for agents.** Give them a small, stable map of where responsibilities live and which files matter.

4. **Don't pay agents to rediscover your architecture.** Record stable decisions once and reuse them.

5. **Keep agent memory boring.** Maintain architectural truths, not a diary of everything the agent has ever done.

6. **Document the economics.** Tell the agent which services, models and operations cost money.

7. **Mock expensive dependencies.** Most application development shouldn't require live AI inference.

8. **Separate discovery from implementation.** If something is uncertain, explicitly buy some prototyping time rather than discovering it accidentally throughout the build.

9. **Use deterministic verification wherever possible.** Don't spend intelligence on questions a test can answer.

10. **Use the cheapest capable model.** Not every task requires the cleverest thing available.

11. **Control retries.** Agentic persistence sounds great until every attempt has a marginal cost.

12. **Measure inference.** AI usage should become visible in project economics rather than disappearing into subscriptions and personal accounts.

13. **Keep humans capable of understanding the system.** Velocity isn't worth much if nobody can maintain what was produced.

14. **Treat shadow AI as infrastructure risk.** If the project depends on it, the organisation needs to know it exists.

None of this means using less AI for the sake of it.

It means spending intelligence where intelligence is actually valuable.

## Assuming any of this matters

There is, admittedly, something slightly absurd about worrying whether Codex is wasting my Hugging Face credits.

People building these systems are simultaneously having much bigger conversations about where increasingly autonomous AI leads.

If some of the people leaving frontier AI labs are right about where this is going, my inference bill is unlikely to be particularly high on the list of problems.

But I'm still building software on Monday morning.

And assuming we're all still here, somebody is going to have to pay for it.

So for now I'm trying to teach the robot something agencies have been trying to teach developers forever:

**The budget is part of the brief.**