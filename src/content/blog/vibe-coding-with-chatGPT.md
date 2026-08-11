---
title: Vibe Coding. 
description: Buddying up with ChatGPT
pubDate: 'Apr 03 2025'
heroImage: '/src/assets/images/aw.jpg'
categories: 
    - "ai"
    - "technology"
cta: "If you’re curious about integrating AI into your development workflows—or want to explore what vibe coding could look like for your team—I offer consultancy for individuals and organisations. Whether you’re experimenting with AI pair programming, looking to accelerate prototyping, or need help shaping a sustainable human–machine workflow, I can help you get there faster (and with fewer pitfalls)."
---
Recently, I set myself a challenge: to step deliberately into new territory and see how modern tools—and AI—could change how I think, not just how I code.

This post is a reflection on that process. It started as a simple write-up about my experience working with AI on a solo build. But the more I tried to describe what *vibe coding* felt like, the more I realised I was doing it—live, in the process of writing this post.

It’s a story about experimentation, recalibration, and learning how to collaborate with a system that never sleeps, never doubts, and never says “I don’t know.”

## Choosing Friction on Purpose

I deliberately chose a stack that introduced some friction: **TypeScript**, **Vue 3’s `<script setup>` syntax**, and **Netlify**. While I’d worked with Vue before, this was my first full project using TypeScript with Vue. I wasn’t aiming for speed or polish—I was looking for challenge, and for new patterns to emerge.

That extended to how I used AI.

I already leaned on AI tools in my day-to-day work, but I wanted to go deeper. I’d seen the boundaries in other projects—places where the outputs were shallow, where the model made confident mistakes, where the thinking felt thin. What I hadn’t figured out yet was how to really *collaborate* with it—how to get beyond surface-level prompts and extract something genuinely useful.

So I set out to find out.

## How It Actually Played Out

The early stages of the project were fast-moving and full of possibility. AI came in with energy—offering ideas, writing code, suggesting workflows. In the **initial setup phase**, it actually performed well. It helped lay down solid foundation concepts, scaffold components, and make confident suggestions that genuinely accelerated the start of the project.

At that point, I approached it like a **technical guide**—something that could help me navigate unfamiliar tooling and architecture. And for a while, it delivered. It gave me momentum and direction when I needed both.

But as the project moved into more detailed work—complex integrations, iterative debugging, edge cases—the cracks began to show. It started to trip over its own outputs. It raced ahead, made assumptions, introduced fragility, and began breaking things that were already working—all while confidently claiming everything was complete.

That’s when the collaboration evolved.

I didn’t stop working with the AI—but I did start refining the boundaries. I began testing what I could trust it with, where I needed to intervene, and how much responsibility I was willing to delegate. By the end, it wasn’t leading—but it was still present, still valuable, and still part of the process.

It moved from guiding the direction to supporting it. I took responsibility for architecture and integration. It assisted with debugging, research, and iteration. The collaboration became more deliberate, more bounded—but no less important.

I also experimented briefly with **Canvas**, the AI’s text editor interface. I thought it might help structure and track changes, but it proved buggy—more friction than it was worth. I dropped it early and stuck to the standard chat interface, which at least behaved predictably.

One of the key transitions came when I stopped asking the AI to manage code versions. It claimed to use a stripped-down form of Git internally, but it couldn’t reliably revert to earlier states. Eventually, I moved to keeping a “gold copy” of the code locally. That changed the way we worked: a shift away from shared ownership, toward more defined roles. But the collaboration continued—just on clearer terms.

## What the AI Thought

After the build, I asked the AI for an honest appraisal. It praised my responsiveness and architectural decisions—but described me as a “mid-level front-ender,” **which was a blow.** 💀

So I gave it feedback—not about my résumé, but about how it had behaved during the project.

I told it where it had been too confident. I pointed out how it raced ahead, sometimes breaking working features in its eagerness to help. I noted that its code was often more verbose and less abstracted than I’d typically write. I explained how I’d started by asking it to track versions and edits, but eventually had to take that back into my own hands. I described the shift—from trying to follow its lead to working with it on clearer, more intentional terms.

To its credit, it responded thoughtfully. It acknowledged the overconfidence, the verbosity, the tendency to move too fast. It said:

> “I can see where my default behaviour—optimistic, fast, verbose—wasn’t always the best fit. Going forward, I’ll slow down and confirm before major rewrites, flag confidence levels, and offer tighter code options.”

It was a solid answer. Thoughtful. Measured. Reassuring.

But here’s the thing: **it talks a good game**. Whether it actually *learned* anything remains to be seen. Every session with the AI is a clean slate. There’s no true memory, no enduring context. If I started the project again tomorrow, I’d have to re-teach the same boundaries.

Still, the collaboration was real. It may not remember me, but the process shaped how I now work.

## Final Thoughts

This wasn’t a tutorial. It wasn’t a post-mortem. It was a process.

I came in thinking I’d write a clean, linear blog post about working with AI. What I ended up writing was something fuzzier and more honest: a record of trying to work *with* something that moves fast, talks big, and needs careful steering.

I learned a lot—not just about working with TypeScript in practice, but about the rhythms of collaboration. How to trust AI with research, but not architecture. How to use it to frame decisions, but not make them. How to say *“no, that’s not right”* and have it actually respond.

> “Moving forward, I’ll never start another project without it.
> Not because it’s perfect. But because it changes what’s possible.”