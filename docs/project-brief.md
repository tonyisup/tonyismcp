# TonyIsUp project brief

## Purpose

TonyIsUp is Antonio Villanueva’s personal, public portfolio and thoughtware site.
It presents a recognizable personal identity, selected projects, a resume, and a
living collection of core-belief essays. Its job is not to be a generic blog or a
social platform. Its job is to make the connection between Tony’s work, creative
output, and evolving ideas legible to visitors.

## Current product surface

The existing Next.js site provides:

- a brutalist portfolio home page with identity, ethos, bio, social links, and
  project cards;
- project discovery for Core Beliefs, Bad Boys Podcast, Break the Ice, and FinCal;
- a Core Beliefs section that loads and renders Markdown essays from
  `app/core-beliefs/essays/`;
- a resume route and related certificate content;
- a Bad Boys Podcast showcase.

The core-belief essays are intentionally living documents. They explore knowledge
loops, consciousness, semantic drift, abstraction, communication, and the ethical
questions raised by increasingly capable AI. They are a record of current thinking,
not settled scientific or medical claims.

## Audience

1. People evaluating Tony’s work, technical interests, and projects.
2. Collaborators or employers looking for a coherent portfolio and resume.
3. Readers interested in the core-belief essays and the ideas connecting semantics,
   communication, AI, and consciousness.

## Current direction

Make the site a clear, credible, maintainable public home for work and thought:

- keep the personal voice and deliberate brutalist visual identity;
- make important projects easy to understand and navigate;
- strengthen discoverability and readability of the essay collection;
- keep project descriptions current as related work evolves;
- make claims legible as personal frameworks, hypotheses, or documented project
  results rather than presenting speculation as established fact.

## Design and content principles

- **Personal, not generic.** Preserve Tony’s direct voice, visual identity, and
  relationship between projects and ideas.
- **Living but accountable.** Essays may evolve, but edits should not quietly erase
  what was previously claimed or blur personal reflection with evidence.
- **Concrete over performative.** Project pages should say what exists, what it does,
  and what remains unfinished.
- **Accessible reading experience.** The visual style should not make long-form
  writing, navigation, or key actions harder to use.
- **Privacy-conscious.** Do not publish private conversation material, credentials,
  sensitive personal data, or claims about other people without clear authorization.

## Non-goals

- Building a social network, comment system, or generalized creator platform.
- Treating the site as scientific proof of philosophical positions.
- Automatically publishing private research notes, conversations, or project data.
- Replacing the dedicated product sites for Break the Ice, FinCal, or the podcast.

## Near-term questions

- Which projects should be featured, archived, or given deeper case studies?
- What is the intended publishing/editing workflow for living essays and revisions?
- Which accessibility and mobile-reading improvements matter most without losing the
  brutalist character?
- Should core-belief essays expose clear dates, revision notes, and source/context
  boundaries for readers?

## Useful external research themes

For link curation, favor sources about:

- durable, accessible personal-portfolio and case-study design;
- long-form web reading, Markdown publishing, and content provenance;
- public communication of speculative AI/consciousness ideas with clear epistemic
  boundaries;
- semantic drift and communication design as they relate to public writing;
- Next.js 15 / React 19 patterns that improve the site without unnecessary platform
  expansion.

Avoid generic web-design trend pieces unless they identify a concrete improvement to
this site’s reading, navigation, accessibility, or project-discovery experience.

## Evidence used

This brief is grounded in the repository as inspected on 2026-07-16:

- `app/page.tsx`
- `app/core-beliefs/page.tsx`
- `app/core-beliefs/essays/00-knowledge-loops.md`
- `app/core-beliefs/essays/10-consciousness-transfer.md`
- `app/showcase/bad-boys-podcast/page.tsx`
- `package.json`

It is a working project brief, not a statement of fact about Tony beyond what the
public site and its checked-in essays establish.
