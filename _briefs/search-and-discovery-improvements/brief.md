---
title: "Faster search, deeper answers: modernizing discovery on the NF Data Portal"
# alt title: "Find more, ask anything: search and discovery improvements on the NF Data Portal"
status: "Draft"
version: "0.1.0"
date: "2026-08-17T00:00:00.000Z"
authors:
  - name: Anh Nguyet Vu
    url: "https://github.com/anngvu"
    affiliation: Sage Bionetworks
    affiliationUrl: "https://sagebionetworks.org/"
    orcid: "0000-0003-1488-6730"
excerpt: "The NF Data Portal is rolling out two search and discovery improvements: a switch to OpenSearch and the addition of a graph-RAG Portal Assistant. This brief covers both and goes more in-depth into how the Portal Assistant is built and, more importantly, how we measure whether it's trustworthy enough to put in front of researchers."
tags:
  - "AI"
  - "New Features"
---

There are different types of questions a researcher can bring to the NF Data Portal. Some are simpler lookups: find this cell line, filter to this data type, get to the right page quickly. The search box was already meant to handle those, though previously it wasn't powerful enough to be customized for more relevant results and lacked niceties like typo tolerance, synonym understanding, and autocomplete. Others aren't simple lookups at all — they require reasoning and synthesis across several sources, or a relationship that doesn't live inside any single field. A researcher planning an experiment on plexiform neurofibromas might come to the portal with a question that sounds simple: *I need isogenic cell line pairs that differ only in NF1 status.* Indeed, the portal has the goods, but this is actually a question could benefit from deeper exploration - an assistant to do research for you. 

Last quarter we added two major portal upgrades, one for each type of question: a migration of the portal's search backend to OpenSearch, and the addition of an AI Portal Assistant. They are not the same. In fact, think of the experience of going to REI. Modern search for a data product or tool should work just as well as on the site there. But if we succeed, the portal assistant should seem more like the in-store staff person you consult when dropping a lot of money on gear.

### OpenSearch: fast discovery and a better experience

We migrated the portal's search backend from MySQL full-text search to [OpenSearch](https://opensearch.org/), an open-source search and analytics engine, to be the first pass for most traffic. It's a whole lot better:

- Autosuggest that reflects the portal's actual vocabulary and phrasing
- Some semantic flexibility through modern text analyzers and synonym configuration
- Ability to fine-tune relevance ranking and therefore continuously improve results
- Fast response times for common lookups and filtering

Its best fit is known-item search, simple metadata lookups, and faceted browsing — the questions that were already answerable before this migration, just faster and with better autosuggest now. It does not, and was never meant to, answer the isogenic-pairs question above.

### The Portal Assistant: for other questions

The portal assistant can pull from multiple knowledge sources at once: help docs, the NF knowledge graph, and a limited set of permissibly-licensed portal publications, all content that OpenSearch doesn't index. So you can ask doc-type help questions, of course, but its strengths are cross-source synthesis, comparisons, explanation-heavy workflows, exploratory analysis, and guided task completion.

#### Example questions

[TODO] Go to nf.synapse.org and copy-and-paste these questions into the chat:



## Evaluations under-the-hood

We are spending most of this brief on the assistant, because the question "Is it trustworthy?" is not something that comes up for the search box results but was anticipated for the new assistant. We do evaluations to test this. Of our multiple different evaluations, two are described here.

In development, we run evaluation on a fork of the [AstaBench](https://github.com/allenai/asta-bench) framework that adds two tasks covering the intended uses: one for portal search and discovery (with a focus on research tools), and one for literature question-answering accuracy.

### Track 1: can it find the right resources?

Our first benchmark is 35 curated discovery questions across mutations, animal models, cell lines, antibodies, genetic reagents, investigators, and cross-resource queries. What's a "hard" question? How different is it from something serviceable through the search box or facet UI? Here's how a question is characterized:

- **Complexity** — how many graph hops the question requires (14 are 0-hop, 15 are 1-hop, 6 are 2-hop).
- **Level** — `baseline` for what current portal technology already supports, `advanced` for what it does not.
- **Facet and text-search answerability** — recorded per question.
- **User frustration** — from `low` (answerable with minimal effort today) to `very_high` (a dead end with current tools).

The last field encodes, per question, how much pain a researcher experiences today, and it lets us ask a question that raw accuracy cannot: *is this new assistant good at things that are currently hard, or only at the things that were already easy?*

For each question, we have verified ground truth as usually a set of expected resource identifiers. The metric is recall over expected identifiers.

[TODO] Updated results

### Track 2: can it be trusted about the literature?

Our "Pub RAG" benchmark is 130 multiple-choice questions over 14 indexed papers, in the format used by [LitQA2](https://huggingface.co/datasets/futurehouse/lab-bench/viewer/LitQA2) and Humanity's Last Exam, both well-known benchmarks. Items were originally generated by frontier models (`claude-opus-4-6`, `gemini-3.1-pro-preview`, `gpt-5.4`) against full text, then reviewed and edited by the NF-OSI team.

The curation pass is where most of the actual work went. Interestingly, an earlier version of Humanity's Last Exam was found to have roughly 30% of its text-only chemistry and biology questions in conflict with the peer-reviewed record. To curate the questions, we had to resolve:

- **Cross-paper conflict.** For exampe, two indexed papers report NF1 population incidence as 1:2000 and 1:2500. A question asking for "the" incidence has no correct answer, so it was removed. Where a fact was merely ambiguous rather than contradictory, questions were narrowed — "current treatment for symptomatic PNs" became a question about pharmacotherapy specifically, distinguishing the paper that says surgery from the one that says selumetinib.
- **Hallucinated ideal answers.** Generated answers sometimes cite mutation variants that do not appear anywhere in the source paper. Every ideal answer was checked against the text.
- **Vague study anchoring.** "What was the CS in the eyeblink conditioning experiments?" is unanswerable when the corpus contains more than one such experiment. Questions were rewritten to anchor to a specific study, because the eval deliberately does not tell the model which paper to read — selecting the right paper is part of the task, and the model cannot ask for clarification.
- **Trivial items.** Questions answerable without retrieval, or with implausible distractors, were dropped. They inflate scores without testing anything.

Scoring reports two independent numbers: **accuracy** on the multiple-choice answer, where our target was 95% accuracy, and **citation F1** over the set of `(pmid, passage)` tuples the model cites. The second is set-based — duplicate citations do not help, extra citations cost precision, missed ones cost recall.

[TODO] Updated results

Accuracy is saturated. Every model is above 96%, and Sonnet misses one question in 130. Read alone, that number says the problem is solved, and it is the number a less careful evaluation would have reported.

Citation F1 is harder, and we want to be transparent about these results. Currently, it sits between 0.64 and 0.77 — meaning the assistant reliably reaches the right conclusion while getting roughly a quarter of its supporting evidence wrong, by citing passages it did not need or omitting ones it did. Perhaps this is not surprising given that even the Google chat summary has been critiqued. The takeaway is still to check citations you are given, and we'll continue working on this.

The two metrics also diverge under paraphrase. Each question exists in a curated `precise` form and a colloquial `user_query` form, the latter closer to how someone actually types into a chat box. Colloquial phrasing barely touches accuracy — but it costs citation F1 consistently, most for the smallest model (Haiku 0.689 → 0.638). Vague questions do not stop a model from landing on the right answer; they degrade its grip on *why*.

Because multiple choice is nearly exhausted, we have added a semantic-judge scorer for short-answer variants, where the model must produce the answer rather than recognize it. We expect the headroom to reappear immediately.

## Limitations

The benchmarks are small — 35 discovery questions and 130 QA items over 14 papers. The QA set has had one round of expert review, not the several we would prefer. Questions require synthesis across passages within a paper but never across papers, which we consider a harder tier and a plausible sequel. Ground-truth attribution lists are genuinely hard to finalize, so citation F1 has irreducible noise from the ground truth itself. Recall on the discovery track does not penalize over-retrieval, which flatters models that return large sets. And the whole apparatus measures the *retrieval* system: it says nothing about how the assistant explains itself, how it behaves over a multi-turn conversation, or whether users trust it.

## Call for community collaboration

Given our stated goal for how we envision the portal assistatnt and the limitations acknowledged, we would love contributions from the community. 

---

*The pipeline, evaluation datasets, and eval harness are open source: [nf-osi/kg-pipeline](https://github.com/nf-osi/kg-pipeline) and [nf-osi/asta-bench](https://github.com/nf-osi/asta-bench). Results dashboards are published from `evaluation/runs.json` and `evaluation/pubs_runs.json`.*
