---
categories:
- development
- cms
- technical-leadership
cta: Need help designing a CMS that works for editors and developers?
description: Where templates work, where blocks work, and where the
  complexity really goes.
heroImage: /src/assets/images/blog/terraced-night-garden.webp
pubDate: Sep 07 2026
theme: "#895129"
title: Templates Validate. Blocks Compose.
---

I've got a bit of a thing about conditional logic in templates.

An `if` statement isn't inherently bad. An `empty()`, `unless()` or
`once()` is often exactly what's needed.

But when I open a template and find lots of conditional logic, I
generally think something has gone wrong.

If this is a product, do this.

If it has a video, do that.

Unless we're on the homepage.

If this option is selected, include this fragment.

Unless it's the first item.

Except when it's mobile.

At some point the template stops describing a thing and starts
describing every possible version of a thing.

That's usually where the trouble begins.

## The page is just an array

For years I've used variations of the same pattern for content-heavy
websites.

I've implemented it in Jekyll, Craft CMS, WordPress with Timber and now
Astro. The syntax changes, but the idea barely does.

A page contains an ordered collection of blocks.

Each block has a type and some data.

The page renderer iterates through them and hands each block to the
appropriate template fragment.

Conceptually, it's not much more complicated than:

``` text
Page
└── blocks[]
    ├── Hero
    ├── Text
    ├── Image + Text
    ├── Video
    ├── Columns
    └── Contact Form
```

The entry-point template doesn't particularly care what's in the array.

It renders it.

The individual block doesn't need to know whether it's on the homepage,
a campaign page or halfway down some obscure landing page.

It receives the data it needs and renders itself.

Whether or not that's technically object-oriented in every
implementation, I've always thought about it in those terms.

The blocks are models.

The renderer deals with a collection of those models.

Each model has its own presentation.

Most importantly, the decision about **what something is** happens
before the front end renders it.

That keeps an enormous amount of logic out of the templates.

## Blocks aren't new

There are plenty of names for this.

Modular content. Component-driven content. Flexible content. Slices.
Stream fields. Page builders.

Craft has Matrix fields. WordPress has blocks and tools like ACF
Flexible Content. Other CMSs have their own versions of essentially the
same idea.

So I'm certainly not claiming to have invented it.

What interests me is how useful the pattern becomes beyond the CMS
itself.

Because a good block isn't just a development component.

It can become a unit of the entire project.

## UX can think in blocks

Web design homogenised itself a long time ago.

I don't particularly mean that as a criticism.

There are only so many useful things a web page needs to do, and users
have spent decades learning how websites work.

The logo takes you home.

Navigation lives at the top.

On mobile there's probably a burger menu.

Pages have heroes.

Content is broken into readable sections.

There are images, videos, calls to action, forms, cards, columns,
related content.

These patterns persist because, broadly speaking, they work.

That makes them extremely useful during UX.

A wireframe can already start identifying the components of the eventual
system.

Hero.

Image and text.

Three columns.

Video.

Related content.

Contact form.

By the time the wireframe reaches creative, we're not designing an
abstract page anymore. We're designing a collection of known pieces.

Creative can design those pieces.

Development can estimate those pieces.

The CMS can model those pieces.

QA can test those pieces.

Documentation can describe those pieces.

And the client can talk about those pieces.

The block becomes a shared language that survives almost the entire
project lifecycle.

## Blocks are surprisingly estimable

This is one of the things I particularly like about them.

"Build the landing pages" isn't a particularly useful development task.

Build:

-   a hero
-   an image/text block
-   a video block
-   a three-column block
-   a related-content feed
-   a contact form

is much easier to reason about.

They're bite-sized.

They can be articulated.

They can be designed.

They can be documented.

And, within reason, they can be estimated.

Once you've built them, assembling another landing page doesn't
necessarily create another development problem.

You're composing things that already exist.

That doesn't make estimating software easy, but it gives everyone a much
more concrete unit to talk about.

## Templates are brilliant too

None of this means I dislike templates.

Templates are fantastic when the structure means something.

A blog post is an obvious example.

It has a title.

A publication date.

A hero image.

An author.

Categories.

Content.

Those fields aren't arbitrary. Together they describe what a blog post
is.

A product is another good example.

Title.

Price.

Images.

Description.

Specification.

Availability.

SKU.

Asking an editor to construct that from a bag of generic blocks would be
ridiculous.

A template gives them the right fields in the right place.

Fill this in.

Upload that.

Choose one of these.

Save.

Templates are incredibly easy to use precisely because they remove
decisions.

They also inherently validate the content.

You can't accidentally forget that a product needs a price if the
content model requires one.

You can't decide to put the SKU between two paragraphs because the
template determines where it belongs.

That's useful.

**Templates validate. Blocks compose.**

## A CMS is as complicated as the content

I'm often asked whether a CMS is easy to use.

It's a slightly strange question.

A CMS is only as simple as the data it has to present.

Give an editor six fields and a save button and, yes, the CMS is
probably going to be extremely easy to use.

Ask them to construct a sophisticated landing page from twenty different
components, each with its own options, relationships and configuration,
and it's going to require more thought.

That isn't necessarily a failure of the CMS.

You've given the user more power.

A block builder asks the editor to make decisions not just about
**content**, but about **structure**.

Which block should I use?

What order should these appear in?

Should this be two columns or three?

Do I need another content block here?

A template has already made most of those decisions for them.

So there's a cost to flexibility.

**Templates reduce decisions. Blocks increase possibilities.**

And we shouldn't give editors possibilities they don't need.

## Sometimes you want both

This is where I usually end up.

A product might have a very strong template because most products share
the same fundamental structure.

But perhaps some products need a video.

Some need related products.

Some need an editorial promotion.

Some need a comparison table.

You could keep adding fields to the product template.

`showVideo`

`showRelatedProducts`

`showPromotion`

`showComparison`

Then the template starts asking questions.

And the conditional logic begins.

Or you can keep the part that is genuinely structured as a template and
add a block area where flexibility is actually useful.

Conceptually:

``` text
Product
├── Title
├── Price
├── Gallery
├── Description
├── Specification
├── Flexible blocks[]
│   ├── Related items
│   ├── Video
│   ├── Promotion
│   └── Comparison
└── Add to basket
```

The editor gets a predictable product-editing experience.

But they also have somewhere to put the exceptional content.

For me, that's often the sweet spot.

Strong templates for things that are genuinely structured.

Blocks where variation is meaningful.

## Blocks move the complexity

There's a danger of making this all sound too easy.

Blocks don't remove complexity.

They move it.

And some of that complexity can be considerable.

If a block can appear anywhere, it can't make too many assumptions about
its context.

Designers, quite reasonably, love things that overlap.

An image might break out of one section and overlap the next.

A background might visually connect two components.

A heading might sit partially inside the block above it.

That looks great in the design.

Then you give an editor a block builder.

The design showed:

``` text
Hero
Image + Text
Quote
```

The CMS permits:

``` text
Quote
Quote
Hero
Form
Hero
Image + Text
```

Now what?

If the components can appear in any order and any combination, all of
those combinations need to behave.

Two dark blocks might sit next to each other.

The same block might appear twice.

Something designed to overlap a white block might suddenly follow a
photograph.

A block with a negative margin might be the first thing on the page.

The CMS has exposed combinations that never appeared in the designs.

That's real development work.

## You have to design the joins

This is one of the most important lessons I've learned from building
these systems.

**You don't just test the blocks. You test the joins between the
blocks.**

Who owns vertical spacing?

The block above?

The block below?

The page?

Can a block assume anything about its neighbour?

What happens when two blocks with the same background meet?

What happens when something appears first?

Or last?

Can every block follow every other block?

Can every block appear twice?

These aren't particularly glamorous questions.

But they're what make the difference between a block system that looks
great on the pages in the original design and one that genuinely works
as a content system.

The price of arbitrary composition is defensive design.

You have to build that flexibility in.

## Don't put the complexity back into the template

You can solve these problems by adding rules.

A video can't follow a hero.

This block is only available on these page types.

If this block follows that block, add this class.

If we're on a product page, render it differently.

Sometimes those constraints are completely legitimate.

But there's a danger.

You've built a flexible component system and then slowly recreated the
contextual template logic you were trying to escape.

That's usually a sign to look at the model again.

Maybe those things aren't actually the same block.

Maybe one should be more constrained.

Maybe the design needs a more predictable rule for how blocks meet.

I'd rather solve those problems in the component system than make every
page understand all the possible relationships between its contents.

## The payoff comes later

Blocks can require more thinking upfront.

The models need defining.

The CMS needs configuring.

The joins need designing.

The combinations need testing.

The editing experience needs consideration.

But once the system matures, there's a payoff I absolutely love.

Someone asks for a new block.

Let's say it's a timeline.

You create the model.

You create the template.

You add the styles.

You add whatever behaviour it needs.

You register it.

And now pages can contain timelines.

The page renderer doesn't need rewriting.

The existing blocks don't need changing.

The landing-page template doesn't gain another conditional.

You haven't had to revisit a load of broader code to explain that
timelines now exist.

**The ability to place the new thing is inherent in the architecture.**

That's a beautiful property of the system.

## Open for extension

There's a software-engineering principle behind this: the Open/Closed
Principle.

Software should broadly be **open for extension, but closed for
modification**.

That's effectively what the block architecture gives you.

The rendering mechanism becomes stable.

New functionality arrives by adding another implementation rather than
repeatedly modifying the existing one.

It's also why I dislike seeing huge amounts of conditional logic
accumulating in templates.

Every new requirement modifies something that already works.

Add enough requirements and the template gradually becomes responsible
for understanding the entire history of the website.

Blocks let you add capabilities without constantly reopening that
history.

## Complexity has to live somewhere

I think this is ultimately the point.

There isn't an architecture where the complexity disappears.

A rigid template moves complexity away from the editor and into the
assumptions made by the system.

A block builder gives the editor more flexibility but requires the
component architecture to cope with more combinations.

A giant configurable template gives everyone flexibility initially, then
tends to accumulate conditionals until nobody is quite sure which
combinations are safe.

The job isn't to eliminate complexity.

It's to decide **where complexity is cheapest to live**.

For repeatable structured content, I want the template to own it.

For editorial composition, I want blocks.

For complex structured content that occasionally needs flexibility, I'll
happily put a block area inside a template.

And in the front end, I want each of those blocks to know as little as
possible about the page surrounding it.

Because once a component needs to understand every context in which it
can appear, it's stopped being a component.

It's becoming another template.

**Templates validate. Blocks compose. Hybrid models do both.**
