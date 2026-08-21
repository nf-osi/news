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

Our first evaluation is a set of 35 curated discovery questions across **mutations**, **animal models**, **cell lines**, **antibodies**, **genetic reagents**, **studies**, **publications**, and **cross-resource** queries. For each question, we have verified ground truth (a set resource IDs for the expected relevant results). These questions are also characterized with user-experience (UX) related attributes, such as something being a "hard" question that takes a lot of work to answer with only search box or facets, or that it's relevant to certain user types. *Is this new assistant good at things that are currently hard, or only at the things that were already easy?*

For each question, the metric is recall over the expected identifiers.

[TODO] Updated results

### Can it be trusted about the literature?

The Portal Assistant was funded in some part because researchers were interested in a "chat with papers" feature. Currently, the Assistant can answer questions on 138 publications listed on the portal - publications are included only if they have permissive licenses, then prioritized by relevance to NF Tools Central in our initial alpha-phase scope. Our target accuracy of at least 95% was achieved, but citation capabilities could be improved. How this worked: accuracy is defined as how often the right answer is selected from a set of choices through effective retrieval and understanding of the paper. Citation used F1 and was whether the model cited the exact references expected for the answer (papers have numbered passages to make it easier to validate). Both metrics were measured on our "Pub RAG" benchmark of 130 multiple-choice questions from 14 of the papers (about 10% of the total corpus), the same format used by well-known benchmarks [LitQA2](https://huggingface.co/datasets/futurehouse/lab-bench/viewer/LitQA2) and Humanity's Last Exam. Items were originally generated by diverse frontier models against full text, then reviewed and edited by the NF-OSI team.

The curation pass is most of the effort here. Interestingly, an earlier version of Humanity's Last Exam was found to have roughly 30% of its text-only chemistry and biology questions in conflict with the peer-reviewed record. To curate the questions, we had to resolve:

- **Cross-paper conflict.** For exampe, two indexed papers report NF1 population incidence as 1:2000 and 1:2500. A question asking for "the" incidence has no correct answer, so it was removed. Where a fact was merely ambiguous rather than contradictory, questions could be made more specific.
- **Hallucinated ideal answers.** Generated answers sometimes cite mutation variants that do not appear anywhere in the source paper. Every ideal answer was checked against the text.
- **Vague study anchoring.** "What was the CS in the eyeblink conditioning experiments?" is unanswerable when the corpus contains more than one such experiment. Questions were rewritten to anchor to a specific study, because the evaluation does not tell the model which paper to read (reflecting real-world retrieval conditions) — selecting the right paper is part of the task.
- **Trivial items.** Too-basic questions answerable without retrieval, or with implausible distractors, were dropped since they inflate scores and don't provide information gain.

[TODO] Updated results

Accuracy is 100% and is perhaps a too-easy evaluation. But it does suggest that the Assistant should be able to answer questions from its collection of papers. 

Citation F1 is strict, and we want to be transparent about these results. Currently, it sits between 0.64 and 0.77 — meaning the assistant reliably reaches the right conclusion while getting roughly a third of its supporting evidence wrong, by citing passages it did not need or omitting ones it did. For comparison, the Google AI overview is accurate 85% to 91% of the time. The takeaway is still to check citations given.

### Researcher verification

Researchers can test out with these example questions. On the [portal](https://nf.synapse.org), copy-and-paste these questions into the chat:

### Limitations

Both benchmarks have limitations, some already mentioned. 

Recall on the resource discovery does not penalize over-retrieval, which flatters models that return large sets.

The Pub QA is small because of the human curation. The QA set has had one round of expert review, not the several we would prefer. Questions require synthesis across passages within a paper but never across papers, which we consider a harder tier and would make a promising sequel to the dataset. Ground-truth attribution lists are genuinely hard to finalize, so citation F1 has irreducible noise from the ground truth itself. 

## How the community can collaborate

We envision the Assistant as something the community can help shape.

- Contribute questions
- Feedback on where it performs well vs where it did not
- Suggest a name for the Assistant

## Acknowledgements

This work was made possible with funding from the [Gilbert Family Foundation](https://gilbertfamilyfoundation.org/).

## References

2. https://www.nytimes.com/2026/04/07/technology/google-ai-overviews-accuracy.html

---

*The pipeline, evaluation datasets, and eval harness are open source: [nf-osi/kg-pipeline](https://github.com/nf-osi/kg-pipeline) and [nf-osi/asta-bench](https://github.com/nf-osi/asta-bench). Results dashboards are published from `evaluation/runs.json` and `evaluation/pubs_runs.json`.*
