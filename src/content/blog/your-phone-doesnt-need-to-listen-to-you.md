---
title: "Your Phone Doesn't Need to Listen to You"
description:  "Privacy isn't only about what one company knows. It's what can be inferred when enough systems know a little — and what happens when one system knows an enormous amount."
pubDate: 'Oct 1 2026'
heroImage: '/src/assets/images/blog/nyc.avif'
theme: '#ff6600'
categories: 
    - "privacy"
cta: "I can help you build digital products that collect less, respect users and still give you the information you actually need"
---
We've probably all had this conversation.

You mention something oddly specific to someone. A holiday destination. A new car. A pair of trainers. Something you've never knowingly searched for.

Then an advert for it appears.

The immediate conclusion is normally:

> My phone is listening to me.

I've never found that explanation particularly convincing.

Not because I'm especially trusting of the enormous technology companies carrying microphones around in our pockets.

Because I don't think they need to.

## They already know quite a lot

Think about how much of an ordinary day can touch Google.

You search for things.

You watch things on YouTube.

You look somewhere up on Maps.

You use Google to navigate there.

You might use Gmail, Calendar, Meet or Chat.

Then you browse the wider web and encounter Google again: advertising, Analytics, YouTube embeds, Maps, reCAPTCHA and even Google Fonts.

Those things don't all collect the same information or use it for the same purposes. Google Fonts, for example, doesn't set cookies and Google says its request logs aren't used for advertising.

But that's almost part of what interests me.

**Google infrastructure touches an extraordinary amount of the web for reasons that often have nothing to do with somebody consciously deciding to interact with Google.**

Depending on your settings and the services involved, Google documents collecting things including searches, videos watched, interactions with adverts and content, purchase activity, people you communicate with, activity on third-party sites and apps using Google services, synced Chrome history and location-related information.

There are important qualifications to that.

Google says it doesn't use the content of Gmail, Drive or Photos for personalised advertising, for example. What gets collected and connected depends on settings, consent, location and which products are involved.

I'm not suggesting there's a big screen in Google HQ with my name at the top and everything I've ever done underneath it.

The point is that there doesn't need to be.

## Lots of boring data becomes interesting

Imagine I'm thinking about buying a particular car.

I search for it.

I watch a couple of reviews.

I look at some used examples.

I check where a dealer is.

I use Maps to get there.

Later I search for insurance.

Then I start looking at local companies that could wrap it.

None of those actions is particularly revealing on its own.

Searching for a car doesn't mean I'm buying one.

Watching a review doesn't mean I want one.

Looking at a dealership on Maps doesn't mean I'm going there.

But put enough weak signals together and they start becoming a much stronger signal.

Google doesn't hide the principle. Its documentation says that, depending on settings, saved activity can be used to infer interests and provide more personalised experiences.

That's the bit I think gets missed in a lot of conversations about privacy.

We tend to worry about individual pieces of information.

My name.

My location.

My email address.

My search history.

But the really powerful thing isn't necessarily any one of those.

**It's what can be inferred when enough apparently harmless data points are aggregated.**

## Pseudonymous doesn't mean useless

This is also why I don't find the distinction between a named person and a pseudonymous identifier particularly comforting in this context.

An advertising system doesn't necessarily need to know that I am Nick Clarkson.

It needs to know that:

> User 736482 appears to be interested in this car, has recently looked at these products, responds to this sort of content and is probably considering spending money on this sort of thing.

That's already commercially useful.

Attach enough observations to an identifier and the fact that the identifier isn't someone's name becomes considerably less interesting.

The system doesn't necessarily need to know who I am.

It needs to be sufficiently confident about what I'm likely to do next.

## Which brings me to Google Analytics

For most of my career, installing Google Analytics has barely been a decision.

You build a website.

You install Analytics.

That's just what websites have.

I'm increasingly uncomfortable with that assumption.

Not because cookies are inherently bad. They're incredibly useful. HTTP is stateless and websites need ways of remembering sessions, baskets, preferences and authentication.

My problem is specifically with the assumption that **basic website analytics requires persistent identification of visitors**.

GA4's standard implementation uses first-party cookies. Google's documentation says `_ga` is used to distinguish users and has a default expiry of two years.

That's interesting.

Because for a huge number of websites, what are we actually trying to find out?

How many people visited?

Which pages did they read?

Where did they come from?

What browser were they using?

Did anyone click the thing we wanted them to click?

I'm not convinced answering those questions requires recognising the same pseudonymous visitor for two years.

## I have a conspiracy theory

And this is where I put my tinfoil hat on.

If I were Google, persistent identification would be incredibly useful to me.

Google isn't primarily an analytics company.

Its wider ecosystem includes search, advertising, YouTube, Maps, Android, Chrome, Workspace and an enormous network of third-party websites using Google technology.

Google Analytics itself makes some of these relationships explicit. Google provides integrations between Analytics and its advertising products, along with features designed to improve cross-device and cross-channel measurement.

So my conspiracy theory isn't that Google invented cookies to spy on everyone.

It didn't.

Nor am I claiming that every Google Analytics identifier is secretly being joined to everything Google knows about a person.

I can't demonstrate that, and Google's published policies and controls place boundaries around how different kinds of data are used.

My question is simpler.

**What commercial incentive does Google have to make genuinely minimal, cookieless analytics the default?**

Persistent identity makes measurement and attribution more powerful.

Those things are particularly valuable in advertising.

And Google makes an enormous amount of money from advertising.

Maybe the answer really is just that persistent identifiers make Google Analytics a better analytics product.

That's entirely plausible.

But Google's incentives aren't necessarily the same as mine.

Google wants to provide extraordinarily capable measurement and advertising infrastructure.

I sometimes just want to know whether anybody read my blog post.

## Google could do it

This is what makes the situation interesting to me.

We're not talking about a technical problem beyond Google's abilities.

Google already has mechanisms for measurement when consent for analytics storage isn't available. It has Consent Mode, modelling and server-side infrastructure.

Google obviously understands privacy engineering.

It has some of the best engineers, infrastructure and data expertise in the world.

If genuinely minimal analytics were the priority, I'm fairly confident Google could build the best privacy-first analytics platform anyone had ever seen.

Instead we've ended up with an increasingly complicated system of cookies, consent management, Consent Mode, advertising consent, analytics consent, modelling and server-side options.

All so that, in many cases, someone can log into Analytics once every three months and discover that 4,327 people visited their website.

## Do you trust anyone with that much data?

There's another question beyond what Google itself chooses to do with information.

**Do I want any single organisation to hold that much data in the first place?**

I can believe Google takes security extremely seriously. It would be extraordinary if it didn't.

But security isn't a binary state.

Systems have bugs.

Credentials are compromised.

Employees make mistakes.

Attackers find vulnerabilities.

Companies change.

Governments change.

Laws change.

And the technology protecting data changes too.

Strong modern encryption isn't something an AI can simply smash through today. But information can remain valuable for decades, while we can't guarantee that the technology protecting it will remain sufficient for the entire lifetime of that information.

That's a strange property of collecting data.

**You have to protect it against threats that don't exist yet.**

And there are much more ordinary routes to the information.

Governments can legally compel technology companies to provide data in certain circumstances. Google publishes transparency reports about government requests and says it reviews requests and challenges inappropriate ones.

That's how the system is supposed to work.

It's also an excellent demonstration of the underlying privacy problem.

**Once data exists, your relationship isn't only with the organisation that collected it.**

You're also relying on its security.

Its employees.

Its suppliers.

Its future owners.

The governments and legal systems it operates under.

And anyone who might successfully compromise or deceive their way into accessing it.

The uncomfortable bit is inference again.

Imagine law enforcement legitimately obtains several pieces of information during an investigation.

A location.

Some searches.

A journey.

A few emails.

A website visit.

Each might have a completely innocent explanation.

Put them together and somebody can construct a story.

They might even construct the wrong story.

That's one of the reasons data minimisation matters.

It isn't simply:

> I trust Google, therefore I'm comfortable with Google collecting it.

The better question is:

> **Does this information need to exist at all?**

Because information that was never collected can't be breached, subpoenaed, stolen, misinterpreted or repurposed later.

## We helped create this

I don't think Google deserves all the blame either.

Agencies and developers have spent years installing Analytics without asking why.

I've done it.

Five-page brochure site?

Google Analytics.

Nobody has defined any KPIs?

Google Analytics.

Client hasn't asked for analytics?

Google Analytics.

Nobody is actually responsible for looking at the reports?

Google Analytics.

It became part of the boilerplate.

Then privacy legislation tightened, browsers became more restrictive and users became increasingly aware of tracking.

So we added another layer of technology to manage the tracking technology we'd added without establishing whether we needed it in the first place.

Cookie banners.

Consent management platforms.

Tag managers.

Consent Mode.

Privacy policies explaining all of it.

We've created a considerable amount of technical and user-experience overhead.

Maybe we should have started with a much simpler question:

**What do we actually need to know?**

## My phone probably isn't listening

Which brings me back to that creepy advert.

I don't know why a particular advert appeared immediately after a particular conversation.

Sometimes it will simply be coincidence.

Sometimes we've forgotten something we searched for or clicked.

Sometimes somebody else may have done something relevant.

And sometimes an advertising system may have inferred an interest from signals that don't seem remotely connected from our perspective.

The important point is that a microphone isn't necessary for that last explanation.

Modern tracking doesn't necessarily need to hear me say:

> I'm thinking about buying that car.

There may already be enough evidence to make a decent guess.

That's much less dramatic than secretly recording everyone's conversations.

I also think it's more interesting.

## And now we're telling AI everything

There's a much newer version of this problem that worries me more.

AI has gone from novelty to personal assistant remarkably quickly.

People use it to write emails.

Review contracts.

Understand medical letters.

Work through relationship problems.

Analyse finances.

Plan careers.

Write code.

Summarise meetings.

Help their children.

Upload documents.

Make decisions.

And unlike the advertising profile I described earlier, a lot of this information doesn't need to be inferred.

**We're volunteering it.**

The useful thing about an AI assistant is context.

The more it understands about what you're doing, what you've done previously and what you're trying to achieve, the more useful it can become.

That's also precisely what makes the privacy question difficult.

A search engine might know what I searched for.

An AI assistant might know **why I searched for it**.

It might know what I'm worried about, who else is involved, what I've already tried and what I'm planning to do next.

And because people want continuity, we increasingly want these systems to remember.

That's incredibly useful.

It's also an extraordinary concentration of personal information.

And unlike the pseudonymous visitor in an analytics platform, we're often explicitly identifying ourselves.

We tell AI who we are.

Where we work.

Who our family are.

What we're building.

What we're worried about.

Then we upload the document as well.

I don't think the answer is to stop using AI or to pretend that personalisation isn't valuable.

I use it because the context is useful.

But we need to recognise the trade we've made.

## Privacy is also about context

I think we've reduced privacy too far if we only talk about databases, cookies and consent forms.

Privacy exists between people too.

If I send somebody a WhatsApp message, I know perfectly well that they can screenshot it.

But that's not the same thing as expecting them to.

I've written something for an audience of one person.

Screenshot it and send it to ten people and the information hasn't changed.

**The context has.**

Post that screenshot publicly and it's changed again.

And I think this matters even when the contents of the message aren't particularly flattering.

Private conversation needs space to be private.

People say stupid things.

They say offensive things.

They make bad jokes.

They phrase things badly.

They say things when they're angry that they reconsider later.

They flirt badly. They overshare. They gossip. They misunderstand things. They try out opinions they haven't completely formed yet.

Sometimes they might even say something creepy.

Being able to have an imperfect private conversation is part of being a person.

Privacy can't only apply to things we'd be perfectly happy having projected onto the side of a building.

In fact, **the things we'd rather weren't projected onto the side of a building are precisely where privacy becomes meaningful.**

That doesn't make a private conversation consequence-free.

A threat doesn't become acceptable because it happened on WhatsApp. Abuse, harassment, safeguarding concerns or evidence of serious wrongdoing can obviously create reasons to share something that outweigh the original expectation of confidence.

But:

> I don't approve of what this person said.

and:

> This conversation needs to be made public.

aren't automatically the same thing.

There's also something particularly uncomfortable about screenshots.

A conversation has participants, history, tone and context.

A screenshot can turn three messages from the middle of that conversation into a permanent artefact.

The person sharing it chooses where it starts.

They choose where it ends.

They choose who sees it.

They provide the explanation.

The other participant may not even know they've acquired a new audience.

Something being technically easy to share doesn't mean the person who created it understood themselves to be publishing it.

## We create privacy decisions for other people too

Photographs of children raise a similar question.

Parents naturally want to share their lives, and their children are an enormous part of those lives.

But a baby can't meaningfully decide whether they want hundreds of photographs documenting their childhood online.

Eventually that baby becomes a child.

Then a teenager.

Then an adult with their own identity, their own relationships and their own opinion about what they want the rest of the world to know about them.

By then, we've potentially been constructing their public digital history for years.

And the internet is very good at remembering things.

I think that's an uncomfortable thing to acknowledge as a parent.

The photograph might be mine.

The Instagram account might be mine.

But **the identity I'm publishing isn't entirely mine to give away.**

That makes me increasingly interested in contextual privacy.

Who did I give this information to?

Why did I give it to them?

Who did I reasonably expect to see it?

How long did I expect it to exist?

What did I expect it to be used for?

And, crucially, was it even my information to share in the first place?

Consent to one thing isn't automatically consent to all the others.

## Privacy should be infrastructure

I think there are a few things that should be fundamental to software development.

Accessibility is one.

Privacy is another.

Where children are involved, appropriate parental controls and safeguarding belong there too.

They shouldn't be features you add once the interesting product work is finished.

They are constraints the product should be designed around from the beginning.

A disabled person shouldn't discover accessibility was scheduled for version two.

A child shouldn't have to understand a surveillance business model to use an app designed for them.

And the rest of us shouldn't need to become privacy engineers just to conduct ordinary lives online.

**We should be able to conduct our lives free from unnecessary surveillance.**

That doesn't mean collecting no data.

It means having a reason for collecting it.

Knowing what you're going to do with it.

Collecting only what you actually need.

Protecting it appropriately.

Respecting the context in which it was provided.

Giving people meaningful control over it.

And getting rid of it when you no longer need it.

Most importantly, it means asking those questions **before** you build the system.

## Collect less

I'm not arguing that nobody should use Google Analytics.

For organisations running serious advertising campaigns, attribution, ecommerce, funnels and cross-channel measurement, its capabilities can be genuinely valuable.

But that's not every website.

I've started preferring much simpler analytics where the requirement allows it.

Not because it produces more data.

Precisely because it doesn't.

I don't automatically need a persistent identity for everyone who visits something I've built.

I don't need to know everything that's technically possible to know.

I need enough information to make the decisions I'm actually going to make.

And I think that principle travels surprisingly well.

Don't collect information because you might find a use for it later.

Don't make something public just because you can.

Don't retain something forever just because storage is cheap.

Don't assume that because somebody told an AI something once, they've consented to every future use of it.

Don't assume that because someone sent you something privately, you've been given permission to publish it.

Don't create a permanent public identity for somebody who isn't yet old enough to tell you what they want that identity to be.

Privacy discussions often focus on whether an individual piece of information is sensitive.

I think that's increasingly the wrong level to look at it.

A search isn't particularly interesting.

A location isn't necessarily interesting.

A page view isn't particularly interesting.

A pseudonymous identifier doesn't look particularly interesting either.

But aggregate enough mundane observations and you can potentially infer something that was never explicitly disclosed.

And with AI, we may not even need the inference.

We might have told it ourselves.

**The privacy problem isn't always what one system knows about you.**

**It's what can be worked out when enough systems know a little bit — or what happens when one system knows an enormous amount.**

The safest data isn't encrypted data.

**It's data you never collected.**

So the next time an eerily relevant advert appears after a conversation, I'm still not going to assume my phone was secretly listening.

I'm going to wonder about something I find considerably more interesting.

**What if it didn't need to?**
