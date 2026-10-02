---
title: A Good Scope Needs Somewhere Soft for Change to Land
description: Why tighter scopes don't always make fixed-price projects safer, and how better constraints, UX and continuous improvement leave room for software to change.
pubDate: 'Oct 02 2026'
heroImage: '/src/assets/images/blog/retro-scifi.avif'
theme: '#39FF14'
categories: 
    - "agency-life"
    - "project-management"
cta: "I can help you scope digital projects around what success looks like, without pretending we know everything before we start."
---
Fixed price is a pretty awful way to buy software.

Unfortunately, it's also completely understandable.

A client needs to provision a budget. Someone needs to approve it. Procurement might need to sign it off. And before committing £50,000, £100,000 or £200,000, they quite reasonably want to understand what they're going to get.

So the agency scopes the project.

We investigate the requirements, make assumptions, identify risks, estimate the work and eventually arrive at something reassuringly definite:

> We'll build this, for this much money, by this date.

Great.

Except we're building software.

And software has an annoying habit of refusing to be that predictable.

## Fixed price is the problem

The wider software industry has spent decades developing ways of dealing with uncertainty.

Agile accepts that we don't know everything at the beginning.

We build something.

We learn.

We reprioritise.

We build some more.

Commercially, that works naturally when someone is paying for a team or an amount of development capacity.

It's considerably harder to sell in an agency.

Imagine saying:

> We think it'll cost about £100,000. It could be £80,000. It could be £140,000. We'll let you know as we go.

Good luck getting that through procurement.

So we put a fixed commercial wrapper around something we know isn't fixed.

And the agency immediately takes on the risk.

If the project turns out to be easier than expected, the client gets the thing they bought for the agreed price.

Fine.

If it turns out to be much harder than expected, the client still gets the thing they bought for the agreed price.

Also fine.

That's the deal.

But it's why agencies become obsessed with scope.

If I've agreed the price before I've done the work, I need to be very clear about what I've agreed to do.

The instinct is completely rational.

The problem is what happens when reality disagrees.

## Scope rigorously

I'm not advocating woolly scopes.

Quite the opposite.

Scoping should be rigorous.

It's where you focus everyone's mind on the solution.

Interrogate the requirements.

Challenge assumptions.

Understand the users.

Think through the architecture.

Identify dependencies.

Expose unknowns.

Understand technical risk.

Work out what needs validating.

Estimate the team and the effort.

A good scoping process should highlight the things you don't know just as much as the things you do.

If there's an integration nobody has tested, say so.

If a requirement depends on research that hasn't happened yet, say so.

If you're making an assumption that materially affects the estimate, make it visible.

But identifying an unknown isn't the same as resolving it.

Some things can only be discovered by doing the work.

**Good scoping doesn't eliminate uncertainty. It tells you where the uncertainty lives.**

## Document deliberately

The scoping process and the scope document don't have to be the same thing.

You can think about something in enormous detail without turning every conclusion into an immutable contractual promise.

Really tight scopes create really hard edges.

Everything works beautifully while the project follows the path everyone imagined.

Then something changes.

The client says:

> This isn't working as we need it to. It won't be fit for purpose.

The agency says:

> But this is what we scoped. You signed it off.

The client says:

> We didn't know this when we signed it off.

The agency checks the document.

> That's outside scope. It'll cost another £5,000.

Except the client doesn't have another £5,000.

They got £100,000 approved.

The agency agreed to deliver the project for £100,000.

And everyone now agrees that blindly following the scope will produce the wrong thing.

What happens?

In my experience, eventually somebody says:

> JFDI.

The agency absorbs it.

The margin takes the hit.

Everyone carries on slightly more annoyed than they were before.

The detailed scope hasn't prevented the problem.

It's just given everyone something to argue about first.

If every detail is a contractual hard edge, the only options when something changes become **no, more money or JFDI**.

A little flexibility gives you another option:

**Negotiate.**

## You bought a project, not a shopping list

This matters because software isn't a collection of independently priced features.

It's a system.

Imagine a project contains a course listing, course search, course detail pages, related courses and subject landing pages.

Those aren't five isolated pieces of work.

They might share a content model, query layer, components, filtering logic and caching strategy.

Removing one doesn't necessarily remove a predictable percentage of the effort.

It might make almost no difference.

It could even make another part more complicated because an abstraction we were relying on no longer makes sense.

Conversely, once we've built the underlying system, something that sounded substantial in the original scope might become almost trivial.

**The cost of a feature isn't intrinsic to the feature. It's partly a property of the system around it.**

That's why I hate the conversation:

> We're not doing X anymore, so can we have Y instead?

Maybe.

But we need to rescope it.

A fixed-price estimate was made for the project as a whole. It includes architecture, project management, QA, dependencies, risk, shared logic and the way all those things interact.

There wasn't a £10,000 search voucher hiding inside it.

**You bought a £100,000 project. You didn't buy £100,000 of features.**

## Give change somewhere soft to land

A slightly looser scope document can make negotiation easier.

Not vague.

Not incomplete.

Not an excuse for failing to understand what you're building.

Be clear about the things that need to be clear.

The outcome.

The budget.

The deadline.

Responsibilities.

Major capabilities.

Dependencies.

Assumptions.

Explicit exclusions.

Acceptance.

Governance.

But leave some room in the implementation.

Then when something changes, the conversation can be:

> This isn't working as expected.

> Agreed. What do we need to change?

Perhaps it's another four days of development.

Fine.

Can something else be simplified?

Has something become less important?

Has another area gone better than expected?

Can the deadline move?

Quite often, I've found the deadline has more give in it than the budget.

And sometimes, yes, the answer really is another £5,000.

But we've arrived there by negotiating the project as it exists today rather than defending the project everyone imagined three months ago.

That requires trust on both sides.

Flexibility can't mean the client has bought an unlimited project.

It also can't mean the agency gets to quietly move the goalposts whenever something turns out to be difficult.

Everyone needs to understand what has changed, what the consequence is and who has the authority to make the decision.

**A scope should help you have the conversation when something changes, not win the argument about whose fault it is.**

Because "computer says no" rarely ends well in agency life.

## Contingency is a myth

This is normally where someone points out that the estimate should contain contingency.

I've put contingency into countless estimates.

I'm increasingly convinced that, in software, it's mostly a myth.

Let's say we estimate a project at £90,000 and add £10,000 contingency.

Great.

We've got £10,000 for the unexpected.

Except software can always consume another £10,000.

There is always something else worth doing.

More testing.

Better error handling.

A cleaner abstraction.

Better accessibility.

Better performance.

More documentation.

Some refactoring.

Better tooling.

Another edge case.

A component that could be reusable rather than solving only today's problem.

None of those necessarily gives the client another feature they can point at.

But they can make the product considerably better.

And for an agency that's going to maintain the thing afterwards, some of them can make a huge difference.

A developer might spot an opportunity that takes another three days now but makes the system significantly easier to maintain for the next five years.

Do you spend the contingency?

From the client's immediate commercial perspective, it doesn't add anything.

From the agency's perspective, not doing it might mean inheriting a support problem of our own making.

**Technical debt doesn't disappear because the client didn't buy it.**

Cutting that corner might make the initial build cheaper.

But we're not necessarily saving the money.

**We're borrowing it from maintenance.**

## When is contingency actually contingency?

I think genuine contingency can exist.

Estimate the project at £90,000.

Plan the team and delivery around spending £90,000.

Then sell it for £100,000.

Leave the other £10,000 alone.

If something unexpected happens, it's there.

If nothing happens, you don't spend it.

That's contingency.

But that's rarely how I've seen it work.

Usually we estimate the work, add contingency and then build a delivery plan around the total number.

The contingency has been consumed before anyone has written a line of code.

It might still say "contingency" in the spreadsheet.

Operationally, it's just budget.

And because software can always be improved, there will always be legitimate ways of spending it.

**Contingency is often just the bit of the budget we haven't found a use for yet.**

## Some things should be hard

None of this means everything should be soft.

Some of the most useful constraints are the ones that introduce objectivity.

Performance budgets are a good example.

Agree upfront that pages need to meet particular Core Web Vitals, Lighthouse scores or page-weight limits and you've created a finite resource.

Every font, tracking script, video, third-party widget and enormous image spends some of it.

So when somebody asks:

> Can we add this third-party widget?

we have something more useful to discuss than whether I personally think it's a good idea.

Maybe we can.

But if it adds 300KB of JavaScript and takes us outside the agreed performance budget, there's a consequence.

If the widget is important enough, fine.

Something else might have to change.

**A good constraint gives you something objective to negotiate against.**

The same applies to accessibility standards, browser support and security requirements.

These aren't necessarily descriptions of exactly what we're going to build.

They're guardrails around how we build it.

And UX can give us another one.

## "Wouldn't it be good if it did this?"

This sentence has probably added millions to the cost of software.

> Wouldn't it be good if it did this?

I have no idea.

Maybe.

But that's not really the question.

A good UX process should already have helped us define what success looks like.

More applications.

More donations.

Fewer support calls.

More people finding the right course.

More completed bookings.

Whatever we're actually trying to achieve.

So when somebody comes up with another feature, we have something better than opinion to test it against:

> **Does this get us further towards the success criteria?**

If it does, great.

Now we can discuss what it costs, what complexity it introduces and whether it's important enough to change the plan.

If it doesn't, why are we building it?

Because a feature isn't free once you've paid to develop it.

It adds code.

It adds page weight.

It adds testing.

It adds accessibility considerations.

It adds maintenance.

It adds another thing that can break.

It adds another thing somebody needs to understand three years from now.

So:

> Wouldn't it be good if the website did this?

becomes:

> Does it move us towards the outcome we're trying to achieve, and is that improvement worth what we're spending to get there?

That's a much healthier conversation.

**Don't use the scope to decide whether a new idea is allowed. Use the project's objectives and constraints to decide whether it's a good idea.**

Sometimes the answer will reveal that the new idea is more important than something we originally planned.

Great.

Change the plan.

## We're not building rocket ships

This is why I often find myself saying:

> We're not building rocket ships.

Most agency projects don't get one opportunity to leave the launchpad.

They're websites and digital products.

We can change them.

We can release something, observe what happens, learn from it and make it better.

Fixed-price projects have a habit of making launch feel like the point at which everything has to be finished forever.

Every feature has to be in.

Every question has to be answered.

Anything deprioritised risks disappearing.

This is where UX becomes commercially useful, not just creatively useful.

Good UX doesn't need to claim we've discovered the perfect solution before development begins.

It can prescribe a **first hypothesis**.

We've done the research.

We've understood the users as well as we reasonably can.

We've challenged the assumptions.

We've designed something we believe will work.

Now build it.

Then find out.

The initial release doesn't have to be our final answer to every question.

It needs to be a good, responsible and testable first answer.

## Sell what happens next

There's a commercial model I've found much more comfortable.

Scope and estimate the initial build.

Then sell 12 months of continuous improvement alongside it.

Now the project has somewhere else for sensible work to go.

Something gets complicated during delivery and isn't essential for launch?

Move it.

A lower-priority feature gets squeezed by something more important?

Move it.

User testing suggests an enhancement?

Move it.

Someone has a genuinely good idea two weeks before launch?

We don't have to shoehorn it into the initial build or start arguing about another £5,000.

There's already a mechanism for dealing with it.

That **softens the release**.

And this isn't somewhere to hide an overspend or an obligation the agency has simply failed to deliver.

Moving something beyond launch still needs to be a mutually agreed decision.

But when that mechanism exists, launch stops being the point where we need to know everything.

In fact, it's the point where we finally start getting some of our best information.

Real users.

Real analytics.

Real search behaviour.

Real support requests.

Real conversion data.

Real accessibility feedback.

We can stop arguing quite so much about what we think users will do and start responding to what they actually do.

## Beware Phase 2

There's an obvious counterargument.

> We'll do it in Phase 2.

I've heard that before.

I've worked on enough waterfall projects to be deeply suspicious of Phase 2.

Phase 2 is where features go to die.

Something gets deprioritised.

Everyone agrees it's still important.

It doesn't need to block launch.

We'll definitely come back to it.

Then we launch.

The urgency disappears.

The project team moves on.

The budget has gone.

Six months later somebody discovers a spreadsheet containing everything that was definitely going into Phase 2.

In my experience, **deprioritised often means abandoned**.

That's why continuous improvement is different.

Phase 2 is an intention.

**Continuous improvement is provisioned capacity.**

There's already a budget.

There's already a team.

There's already time.

There's already a backlog.

There's already a mechanism for deciding what happens next.

That means something can genuinely move out of the initial build without everyone quietly knowing it may never come back.

And I make the alternative explicit in the initial scope.

If there isn't a continuous improvement agreement, **the scope resets after delivery**.

Anything that comes afterwards is new work.

New scope.

New estimate.

New budget.

Otherwise Phase 2 becomes an imaginary extension of the original project.

The client remembers:

> That's still included. We're just doing it later.

The agency remembers:

> We deprioritised that to get the project delivered.

Six months later, you've got a commercial problem waiting to happen.

A scope reset removes the ambiguity.

If we mutually agree to remove something from the initial release and there's no continuous improvement agreement, we're not quietly promising to build it later using whatever happens to be left of the original budget.

We're saying:

> This is no longer part of the project we're delivering. If we still want it after launch, we'll scope it again based on what we know then.

And that's arguably a better time to scope it anyway.

We'll have a live product.

Real users.

Real evidence.

And a much better understanding of the system than we had when we wrote the original scope.

Continuous improvement gives work somewhere to go.

**Without it, launch draws a line under the commercial agreement.**

## Be soft about solutions. Be hard about constraints.

None of this magically fixes the fundamental problem.

Fixed price is still an awkward way to sell unpredictable work.

The agency is still carrying risk.

Clients will still change their minds.

Technology will still surprise us.

Estimates will still be wrong.

There will still be difficult conversations.

But fixed price exists for good reasons.

Clients need budgets.

They need accountability.

They need to understand what they're buying.

And agencies need to operate within that reality.

For me, the answer isn't an increasingly enormous scope document attempting to remove every possible uncertainty.

**Scope rigorously. Document deliberately.**

Understand the project in as much detail as you reasonably can.

Expose the unknowns.

Estimate the system, not a shopping list of features.

Be hard about the things that matter: outcomes, budget, performance, accessibility, security and responsibilities.

Be softer about exactly how you achieve them.

Use UX to give the first release a defensible hypothesis rather than pretending it's the final answer.

And, if possible, provision the relationship beyond launch so the things you learn actually have somewhere to go.

A scope should give everyone a framework for making good decisions when things change.

Because things will change.

We're building software.

**We're not building rocket ships.**