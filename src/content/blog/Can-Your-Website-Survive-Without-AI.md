---
title: "Can Your Website Survive Without AI?"
description: "Agentic development is changing how software gets built and maintained. But what happens when the developer, agency, agent — or AI itself — changes?"
pubDate: 'Sep 25 2026'
heroImage: '/src/assets/images/blog/volcano.jpeg'
theme: '#c65a1e'
categories:
    - "ai"
    - "development"
    - "digital-strategy"
cta: "I can help you build websites that are maintainable, portable and ready for whatever comes next."
---
I've been thinking about what happens to all the software we're building with AI in five years.

Not whether AI will replace developers.

Not whether agents write good code.

Not even whether they're cheaper.

Something much more boring.

**What happens when somebody else has to maintain it?**

I've inherited enough websites over the years to know what that normally looks like.

The original developer has gone. The agency that built it no longer exists. Nobody quite knows why something works the way it does. There's a README confidently telling you to install a version of Node that hasn't existed for four years.

Then you start digging.

Git history. Old tickets. Comments. Documentation if you're lucky. Eventually you build a mental model of the thing and start making changes.

We've always had a knowledge problem when developers leave.

Agentic development could make that considerably better.

Or considerably worse.

## The invisible team member

I've increasingly started thinking about coding agents as extensions of the development team.

That's certainly how I use them.

I give an agent problems. I provide context. I review what it does. I correct it. I constrain it. Sometimes I reject what it's done completely.

Over time, you get better at working together.

You learn what to delegate. You learn where it struggles. You develop rules for it. The repository starts containing instructions specifically intended to help it understand the project.

At some point the distinction between *tool* and *team member* gets a little fuzzy.

Except there's an important difference.

**The company manages the development team. Individual developers manage their agents.**

The company employs me.

It doesn't necessarily employ my relationship with Codex.

Imagine I've spent a year building and maintaining a website with it.

The code is in Git. The tests are there. The commits are there. Hopefully the documentation is there.

But there's another layer of knowledge surrounding the project.

Conversations. Personal instructions. Previous investigations. Things we've tried and abandoned. The way I've learnt to brief the agent. My understanding of when it can be trusted and when I need to intervene.

If I leave, how much of that leaves with me?

We've spent years worrying about developers becoming single points of failure.

Agentic development could accidentally give every developer a second, invisible single point of failure.

## This could actually make things better

The strange thing is that agents might also help solve the problem.

Agents need context.

They need to understand the architecture. They need to know what they shouldn't change. They need conventions, tests and boundaries.

If you repeatedly have to explain those things to an agent, eventually you start writing them down.

I've found myself doing exactly this.

Instead of paying an agent repeatedly to rediscover the architecture, I put the important information in the repository.

That's partly about efficiency.

But I've accidentally created documentation.

And unlike the project documentation sitting forgotten somewhere else, it gets used because the thing writing the code actually needs it.

That's potentially a very good development practice.

## Promote knowledge out of the conversation

I think there's a simple principle here:

**Anything the agent needs to know repeatedly should eventually stop belonging to the agent.**

If it's an architectural rule, document it.

If it's a coding convention, put it in the repository instructions.

If it's an important business rule, document it and ideally enforce it with a test.

If it's a dependency, make it explicit.

If a prompt genuinely forms part of the application, version it.

If something must never happen, don't rely on an AI remembering a conversation from six months ago.

And don't preserve every conversation either.

I don't particularly want a future developer to inherit 18 months of me arguing with an AI about a CSS transition.

Most of that is disposable.

The useful bit is the conclusion.

The repository should contain the durable knowledge required to understand the system, regardless of who — or what — works on it next.

## But what if the next developer doesn't use an agent?

This is where it gets more complicated.

We're assuming the next developer arrives with another coding agent.

They might not.

They might not like agentic development. Their agency might prohibit it. Their client might prohibit it. Security requirements might prevent it.

Or they might simply believe developers should write their own code.

I'm still seeing resistance to agentic development.

Some of it reminds me of the sync button in DJing.

For years there has been an argument that using sync isn't proper DJing because the DJ should be able to beatmatch manually.

There's a slightly ridiculous version of that argument.

Refusing to use a useful tool specifically because it makes something easier doesn't prove much.

But there's also a much better version:

**If the technology is doing something for you, make sure you can still do it when the technology isn't there.**

And unfortunately, we have an excellent demonstration of why.

## Grimes at Coachella

In 2024, Grimes had a fairly spectacular technical failure during her Coachella DJ set.

The BPM information for her tracks had been incorrectly analysed. Her normal workflow depended on that information being correct, and when it wasn't, the set started falling apart.

That's not interesting because a DJ had technical problems. Every DJ has technical problems.

It's interesting because it suddenly validated part of the old sync-button argument.

The problem wasn't using technology.

**The problem was discovering what you couldn't do when the technology stopped helping.**

I think there's a lesson in there for developers.

## Agentic code shouldn't require an agent

If I can ask an agent:

> Find everywhere this state is mutated, trace the lifecycle and explain why this behaviour occurs.

I don't personally have to trace every part of it.

That's incredibly useful.

But it could also allow complexity into a system that I wouldn't tolerate if I knew I had to understand it manually.

Take the agent away and the code still works.

But suddenly something that took five minutes to investigate takes half a day.

The software's maintainability was partly being subsidised by AI.

That's a dependency even if there isn't an AI API anywhere in the production application.

So I'd add another principle:

**Software built with an agent shouldn't require an agent to maintain it.**

A competent developer should still be able to clone the repository, read the documentation, run the application, understand its architecture and safely make a change.

An agent can make that process much faster.

It shouldn't be the only thing making it possible.

## Is your website actually portable?

This matters beyond development teams.

Clients have been asking versions of this question for years.

Do we own the source code?

Do we own the domain?

Can we move hosting?

Is the CMS proprietary?

Can another agency work on it?

These are sensible questions.

But agentic development introduces another one.

**Does somebody else have the capability to maintain this system economically?**

Imagine an agency builds a substantial website in 2026.

Three years later, the client puts the support contract out to tender.

Another agency wins.

They receive the complete repository.

It's standard TypeScript, PHP, Drupal, whatever. Nothing proprietary.

On paper, the website is completely portable.

Except the original team built and maintained it with agents deeply integrated into its workflow.

The new agency doesn't work that way.

Something that used to take two hours now takes a day.

Nothing about the software has technically become less portable.

But the capability required to maintain it has changed.

**Owning the source code isn't necessarily the same as owning the capability required to maintain it.**

That's something clients need to start understanding when they think about portability.

## The new agency might simply be behind

There's an uncomfortable part of this argument for agencies too.

If one agency can safely investigate, change and test something in four hours using agents and another needs two days to do the same work manually, that's not just a philosophical disagreement about craftsmanship.

There's a commercial consequence for the client.

An agency can refuse agentic development on principle.

A developer can refuse to use the sync button.

But eventually the customer is paying for the principle.

That doesn't mean the fastest agency is automatically the best one.

It means that **development capability itself is changing**, and portability increasingly includes the capability of the team inheriting the work.

But there's an equally uncomfortable argument in the opposite direction.

The agency refusing AI might turn out to have protected something useful.

## What if the original agency loses AI?

The portability problem doesn't only exist when a client changes supplier.

Imagine the client stays with the original agency.

Same developers.

Same repository.

Same people who built it.

Then something outside their control changes.

The model disappears.

The provider changes its product.

Pricing changes dramatically.

The client changes its security policy.

The organisation stops allowing proprietary code to be processed by a particular service.

Regulation changes.

A major security incident changes the industry's appetite for autonomous coding agents.

Suddenly the agency hasn't inherited somebody else's software.

**It's inherited its own software under different development conditions.**

That's potentially much worse.

Because if the team has allowed the agent to substitute for capability rather than augment it, the knowledge hasn't necessarily gone anywhere.

The ability has.

The BPM display is wrong.

Sync isn't behaving as expected.

And we're all standing on stage at Coachella.

## What if this is the easy bit?

There's a huge assumption underneath the way we're currently adopting agentic development.

We're extrapolating forwards.

Models will improve.

Context will get larger.

Agents will become more autonomous.

Inference will get cheaper.

Businesses will become more comfortable with it.

Agentic development will become normal.

All of that seems plausible.

None of it is guaranteed.

The next 18 months could change the landscape substantially.

Not because AI stops working.

It doesn't need to.

Regulation, copyright decisions, security incidents, energy constraints, pricing, procurement or data protection could all change the conditions under which we're allowed or willing to use it.

A provider could disappear.

A capability we rely on could become prohibitively expensive.

A client could simply say no.

AI doesn't have to fail for an AI-dependent development process to fail.

## Agentic portability

We've traditionally thought about portability in technical terms.

Can I move the application away from this host?

Can another agency maintain it?

Can we export the data?

Can we replace this integration?

I think we now need another category.

**Agentic portability.**

A genuinely portable system should be able to survive several transitions:

Developer to developer.

Agency to agency.

Agent to agent.

AI provider to AI provider.

Agentic team to non-agentic team.

And potentially:

**Agentic development to a world in which agentic development is significantly more restricted than it is today.**

That's not an argument against using agents.

It's an argument against making assumptions about the future availability of any dependency.

## Agents could still make legacy software dramatically better

Despite all of that, I'm optimistic.

Taking over an unfamiliar codebase is expensive.

A developer has to build a mental model of it before they can safely change it.

Where does authentication happen?

What calls this service?

Why is this class here?

Is this function still used?

What happens if I change this interface?

Historically, answering those questions can mean hours or days of archaeology.

An agent can inspect a repository, trace references, explain unfamiliar code, compare implementation against documentation and show an incoming developer where to start looking.

That's an extraordinary tool for maintaining legacy software.

And if the original developers have been writing down architectural context because their own agents need it, the incoming developer gets that too.

Agentic development could create some of the easiest software we've ever had to inherit.

## Or some of the hardest

The alternative isn't difficult to imagine.

A developer and their private AI produce an enormous amount of software very quickly.

Architectural decisions happen inside conversations nobody else sees.

Complexity is tolerated because the agent can navigate it.

Human documentation gets neglected because the agent can read the code.

The software works.

The developer leaves.

Or the client moves agency.

Or the AI provider changes.

Or the organisation decides it can no longer use the tool.

Good luck.

Same technology.

Completely different outcome.

## Don't confuse automation with capability

That's where I think the sync-button argument ultimately lands.

A good DJ can understand beatmatching and use sync when it's useful.

Those things aren't contradictory.

A developer should understand the systems they're responsible for.

A team should retain enough knowledge to operate without an agent.

An agency should be able to explain how its software can be inherited by somebody who works differently.

And a client should understand when the maintainability of its website depends on capabilities that aren't actually contained in the website.

None of that means we should stop using agents.

Quite the opposite.

Use them.

Let them inspect repositories.

Let them trace bugs.

Let them automate repetitive work.

Let them make us faster.

But don't mistake what the tool can do for what the team can do.

## What happens in five years?

We're currently measuring agentic development by how much faster it allows us to build software.

That's understandable.

It's new.

That's the exciting bit.

But websites don't disappear when the sprint ends.

They sit in the wild.

Browsers change.

APIs disappear.

Dependencies become unsupported.

Clients change agencies.

Developers leave.

AI providers change.

And eventually somebody opens the repository and has to work out what we were thinking.

The real test of agentic development might not be how quickly we can build something in 2026.

It might be how easily somebody else can understand it in 2031.

The agent that helped create the software doesn't necessarily need to survive.

The developer who managed it doesn't necessarily need to remain.

Even the development environment that made it possible might change completely.

What matters is that the software remains understandable and maintainable when any of them disappear.

Use the agents.

Take the productivity.

Just make sure that, every now and again, you can still turn the sync button off.