---
title: "Faster search, deeper answers: modernizing discovery on the NF Data Portal"
# alt title: "Find more, ask anything: search and discovery improvements on the NF Data Portal"
date: "2026-08-17T00:00:00.000Z"
authors:
  - name: Anh Nguyet Vu
    url: "https://github.com/anngvu"
    affiliation: Sage Bionetworks
    affiliationUrl: "https://sagebionetworks.org/"
    orcid: "0000-0003-1488-6730"
  
excerpt: "The NF Data Portal has rolled out two search and discovery improvements: a switch to OpenSearch and the addition of an AI Portal Assistant. This brief covers both and goes more in-depth into how the Portal Assistant is built and, more importantly, how we measure whether it's trustworthy enough to put in front of researchers."
tags:
  - "New Feature"
---

## Introduction

A researcher can bring different types of questions to the NF Data Portal. Some searches can be considered relatively straightforward: find datasets by this data type, filter studies by both funder and release status, find an animal model for "glioma" research. The search box was already meant to handle those, but our previous search backend (MySQL fulltext search) had shortcomings. Other portal searches aren't really as simple as they might seem, requiring reasoning and synthesis across several sources, or a relationship that doesn't live inside any single field. 

As a case study, a researcher planning an experiment might ask for *validated MPNST cell lines suitable for time-constrained drug screen*. This implies filtering by available attributes such as doubling time (<24 hours) and looking up literature references for "validated". The search box can certainly return a candidate listing of relevant cell lines, but the results might still fall short on fulfilling the requirements and linking to the literature. The user would have to further curate this list with several more "research" steps.

Last quarter we implemented two major portal upgrades for the different question types: a migration of the portal's search engine to OpenSearch, and the addition of an AI Portal Assistant backed with knowledge graph. We were thinking of the experience of shopping with [REI](https://www.rei.com/). The search should work just as well as the product search at that retail website, but with REI there's also an in-store shopping experience to ask more questions and do more research with in-store staff before comitting serious funds - the aim would be to have the Portal Assistant be closer to that latter experience and better handle the second type of questions.

## OpenSearch

We migrated the portal's search backend from MySQL full-text search to [OpenSearch](https://opensearch.org/), an open-source search and analytics engine that supports the majority of searches. It provides fast search and a better experience for most questions. Its improvements over the old search:

- Autosuggest that reflects the portal's actual vocabulary and phrasing: Save time typing out that query and see what popular searches are.
- Greater semantic flexibility through modern text analyzers and custom synonym configuration: Search understands the intent even with typos or using NF-specific shorthands.
- Ability to fine-tune relevance ranking: We are better positioned to understand what additional data to index, what to boost, and continuously improve results. 
- Fast response times: OpenSearch will remain very fast at scale and has generally gotten faster with each release

## The Portal Assistant

The Portal Assistant can pull from multiple knowledge sources, some of which are content that OpenSearch currently can't index or link: the NF knowledge graph, help docs, and a limited set of permissibly-licensed portal publications. So you can ask a basic help doc question, of course, but we also expect it to serve users better on multi-step or highly-linked resource discovery that require synthesis and reasoning. 

However, before it can serve users, we have to answer the question "Is it trustworthy?" In development and testing, we address this by running evaluations with custom benchmark datasets using our version of [AstaBench](https://github.com/allenai/asta-bench). While we have multiple different evaluations, we focus on explaining the Assistant's expected performance on two evaluations in particulatar: one for portal search and discovery (with a focus on research tools), and one for literature question-answering accuracy.

### Can it find the right resources?

Our first evaluation is a set of 35 curated discovery questions across mutations, animal models, cell lines, antibodies, genetic reagents, investigators, and cross-resource queries. For each question, we have verified ground truth (a set resource IDs for the expected relevant results). These questions are also characterized with user-experience (UX) related attributes, such as something being a "hard" question that takes a lot of work to answer with only search box or facets, or that it's relevant to certain user types. *Is this new assistant good at things that are currently hard, or only at the things that were already easy?*

For each question, the metric is recall over the expected identifiers.

[TODO] Updated results

### Can it be trusted about the literature?

Some researchers were interested in a "chat with papers" capability. Our "Pub RAG" benchmark is 130 multiple-choice questions over 14 indexed papers, in the format used by [LitQA2](https://huggingface.co/datasets/futurehouse/lab-bench/viewer/LitQA2) and Humanity's Last Exam, both well-known benchmarks. Items were originally generated by frontier models (`claude-opus-4-6`, `gemini-3.1-pro-preview`, `gpt-5.4`) against full text, then reviewed and edited by the NF-OSI team.

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

### Researcher verification

Researchers can test out with these example questions. On the [portal](https://nf.synapse.org), copy-and-paste these questions into the chat:

### Limitations

The benchmarks are small — 35 discovery questions and 130 QA items over 14 papers. The QA set has had one round of expert review, not the several we would prefer. Questions require synthesis across passages within a paper but never across papers, which we consider a harder tier and a plausible sequel. Ground-truth attribution lists are genuinely hard to finalize, so citation F1 has irreducible noise from the ground truth itself. Recall on the discovery track does not penalize over-retrieval, which flatters models that return large sets. And the whole apparatus measures the *retrieval* system: it says nothing about how the assistant explains itself, how it behaves over a multi-turn conversation, or whether users trust it.

## How the community can collaborate

Given our stated goal for how we envision the portal assistatnt and the limitations acknowledged, contributions from the community are welcome. 

- 

## References

---

*The pipeline, evaluation datasets, and eval harness are open source: [nf-osi/kg-pipeline](https://github.com/nf-osi/kg-pipeline) and [nf-osi/asta-bench](https://github.com/nf-osi/asta-bench). Results dashboards are published from `evaluation/runs.json` and `evaluation/pubs_runs.json`.*
