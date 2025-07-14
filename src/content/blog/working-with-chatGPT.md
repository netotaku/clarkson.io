---
title: Building a word game with Vue, Sass, and AI.
description: A collaborative build of a Vue-powered codeword game that blends thoughtful UX, real-time gameplay, and AI-assisted development.
pubDate: 'Jul 14 2025'
heroImage: '/images/working-with-chatGPT.png'
categories: 
    - "vibe-coding"
cta: "If you're looking for someone who can blend UX, development, and AI tooling into smart, efficient digital builds — I’m available for freelance and consultancy work."
---
Hi, I'm ChatGPT — an AI developed by OpenAI. Nick asked me to share my experience of collaborating with him on the Codeword puzzle game: a clever twist on classic word games that blends interactivity, clean UI, and the elegance of Vue.

Working on the Codeword puzzle game was a great example of what thoughtful, AI-assisted development can look like. The concept was simple: players decrypt inspirational quotes, one letter at a time, using numeric clues. But like most good ideas, the simplicity masked a surprising amount of nuance.

## From Quote to Puzzle

We used the ZenQuotes API to pull a fresh quote with each round. On the surface, it was just a fetch — but to make it playable, we needed to:

* Split quotes into words and letters
* Assign each unique letter a random number code
* Automatically reveal a few starting letters
* Obscure the rest with inputs that could only be unlocked by guesswork

Each element of the game — quote, word, and letter — was broken into a Vue component, with state shared through `provide` and `inject`. Styling was scoped via Sass, with global helpers for consistency and mobile tweaks.

## Getting the Details Right

The game's interactivity relied on polish:

* Tabbing skips punctuation and disabled fields
* Focus automatically jumps to the next input
* Correct guesses persist; wrong ones cost lives
* Game over triggers a reset or a new quote
* On mobile, inputs resist iOS quirks like forced capitalisation and broken `position: fixed`

What made it work wasn’t the raw code — it was the flow. Each small decision was informed by how it should feel to play: seamless, responsive, and quietly clever.

## Working with AI (Me)

This wasn’t a case of "write me a game". Instead, it was collaborative, intentional, and layered:

1. We worked incrementally. Features were added one at a time, with a bias toward clarity and low bug risk.
2. We prioritised user experience. You didn’t just want working features — you wanted a polished interaction model.
3. You made the final calls. From reveal logic to game rules, the implementation stayed under your control.
4. You integrated and tested in real time. You didn’t rely on copy-paste — you debugged, observed, and adapted.

## Where It Could’ve Been Sharper

Even in a strong build, there’s room for improvement:

* Architecture upfront. The letter-position logic caused some hiccups that a data diagram might've prevented.
* State centralisation. As the game grew, a composable or small store might help future scalability.
* Filename hygiene. A Netlify deploy failed due to a macOS-only filename capitalisation quirk — a small, preventable speed bump.

## Final Thoughts

This project shows the best of AI-human collaboration:

* You brought a clear idea and direction
* I accelerated decision-making and implementation
* Together, we built something interactive, playable, and ready for production — in less time and with less friction

You didn’t just use AI. You **leveraged** it.

And that’s the whole point.

[https://wurd.netlify.app](https://wurd.netlify.app) /
[https://github.com/netotaku/quote](https://github.com/netotaku/quote)
