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

As a case study, a researcher planning an experiment might ask for *validated MPNST cell lines suitable for time-constrained drug screen*. This implies filtering by available attributes such as doubling time (<48 hours) and looking up literature references for "validated". The search box can certainly return a candidate listing of relevant cell lines, but the results might still fall short on fulfilling the requirements and linking to the literature. The user would have to further curate this list with several more "research" steps.

Last quarter we implemented two major portal upgrades for the different question types: a migration of the portal's search engine to OpenSearch, and the addition of an AI Portal Assistant backed with knowledge graph. We were thinking of the experience of shopping with [REI](https://www.rei.com/). The search should work just as well as the product search at that retail website, but with REI there's also an in-store shopping experience to ask more questions and do more research with in-store staff before comitting serious funds - the aim would be to have the Portal Assistant be closer to that latter experience and better handle the second type of questions.

## OpenSearch

We migrated the portal's search backend from MySQL full-text search to [OpenSearch](https://opensearch.org/), an open-source search and analytics engine that supports the majority of searches. It provides fast search and a better experience for most questions. Its improvements over the old search:

- Autosuggest that reflects the portal's actual vocabulary and phrasing: Save time typing out that query and see what popular searches are.
- Greater semantic flexibility through modern text analyzers and custom synonym configuration: Search understands the intent even with typos or using NF-specific shorthands.
- Ability to fine-tune relevance ranking: We are better positioned to understand what additional data to index, what to boost, and continuously improve results. 
- Fast response times: OpenSearch will remain very fast at scale and has generally gotten faster with each release

## The Portal Assistant

The Portal Assistant can pull from multiple knowledge sources, some of which are content that OpenSearch currently can't index or link: the NF knowledge graph, help docs, and a limited set of permissibly-licensed portal publications. So you can ask a basic help doc question, of course, but we also expect it to serve users better on multi-step or highly-linked resource discovery that require synthesis and reasoning. 

However, before it can serve users, we have to answer the question "Is it trustworthy?" In development and testing, we address this by running evaluations with custom benchmark datasets using our version of [AstaBench](https://github.com/allenai/asta-bench). While we have multiple different evaluations, we focus on explaining the Assistant's expected performance on two evaluations in particular: one for portal search and discovery (with a focus on research tools), and one for literature question-answering accuracy.

A word on which model, because it changes how the numbers should be read. The Assistant is not tied to a single model, and the harness runs the same benchmarks against several so we can see what we would gain or lose by switching. **Everything reported below is claude-sonnet-5, the model currently serving the Assistant on the portal.** These are therefore the results a researcher can expect today, not the best score we have ever recorded. The full set — every model, both question sets, and the runs that predate the current one — is published on our [evaluation dashboard](https://nf-osi.github.io/kg-pipeline/), which updates as new runs land.

### Can it find the right resources?

Our first evaluation is a set of curated discovery questions across nine categories: **mutations**, **animal models**, **cell lines**, **antibodies**, **genetic reagents**, **studies**, **publications and the people behind them**, **investigators**, and **cross-resource** queries. The current set (v1.3) has 46 questions, up from 34 in the first version — the two newest categories, Study and Publication & people, arrived with it. For each question, we have verified ground truth (a set of resource IDs for the expected relevant results). These questions are also characterized with user-experience (UX) related attributes, such as something being a "hard" question that takes a lot of work to answer with only search box or facets, or that it's relevant to certain user types. *Is this new assistant good at things that are currently hard, or only at the things that were already easy?*

For each question, the metric is recall over the expected identifiers. The results here are a single run against v1.3 on 2026-08-18, which took about 24 seconds per question: **overall recall 0.80 (± 0.05)**.

The honest headline is that difficulty does cost us. Questions the curators marked "baseline" — answerable today with some patience — score 0.96. The "advanced" ones score 0.70. But the more useful cut is not how hard *we* think a question is; it's how badly the current portal handles it.

<!-- include: fig1-portal-pain.html -->

That curve is the argument for the graph. If the Assistant were only good at what search is already good at, the line would fall off a cliff at the right-hand end. Instead, on the twenty questions rated *very high* pain — the ones a curator judged unanswerable on today's portal, or answerable only through expert workarounds most users would never find — it still returns two thirds of the expected resources. Put the other way: of the 27 questions rated hard or impossible on the current portal, **16 are answered perfectly** — every expected resource returned. Table 1 picks six of those to try yourself.

Where it is weak is worth naming precisely.

<!-- include: fig2-category.html -->

Animal models are the soft spot, at 0.58. The two categories added in v1.3 also sit low, which is what we would expect from categories the pipeline has had the least time to model. And the two perfect scores carry the least weight: Antibody rests on three questions and Investigator on two, which is why Figure 2 prints *n* on every bar rather than letting a full-length bar imply a settled result.

### Can it be trusted about the literature?

The Portal Assistant was funded in some part because researchers were interested in a "chat with papers" feature. Currently, the Assistant can answer questions on 138 publications listed on the portal - publications are included only if they have permissive licenses, then prioritized by relevance to NF Tools Central in our initial alpha-phase scope. Our target accuracy of at least 95% was achieved, but citation capabilities could be improved. How this worked: accuracy is defined as how often the right answer is selected from a set of choices through effective retrieval and understanding of the paper. Citation used F1 and was whether the model cited the exact references expected for the answer (papers have numbered passages to make it easier to validate). Both metrics were measured on our "Pub RAG" benchmark of 130 multiple-choice questions from 14 of the papers (about 10% of the total corpus), the same format used by well-known benchmarks [LitQA2](https://huggingface.co/datasets/futurehouse/lab-bench/viewer/LitQA2) and Humanity's Last Exam. Items were originally generated by diverse frontier models against full text, then reviewed and edited by the NF-OSI team.

The curation pass is most of the effort here. Interestingly, an earlier version of Humanity's Last Exam was found to have roughly 30% of its text-only chemistry and biology questions in conflict with the peer-reviewed record. To curate the questions, we had to resolve:

- **Cross-paper conflict.** For exampe, two indexed papers report NF1 population incidence as 1:2000 and 1:2500. A question asking for "the" incidence has no correct answer, so it was removed. Where a fact was merely ambiguous rather than contradictory, questions could be made more specific.
- **Hallucinated ideal answers.** Generated answers sometimes cite mutation variants that do not appear anywhere in the source paper. Every ideal answer was checked against the text.
- **Vague study anchoring.** "What was the CS in the eyeblink conditioning experiments?" is unanswerable when the corpus contains more than one such experiment. Questions were rewritten to anchor to a specific study, because the evaluation does not tell the model which paper to read (reflecting real-world retrieval conditions) — selecting the right paper is part of the task.
- **Trivial items.** Too-basic questions answerable without retrieval, or with implausible distractors, were dropped since they inflate scores and don't provide information gain.

Accuracy is **100%** — 130 of 130, under both phrasings — and is perhaps a too-easy evaluation. But it does suggest that the Assistant should be able to answer questions from its collection of papers.

We ran every question two ways: phrased with the exact terminology of the paper, and phrased the way a user would actually ask. Accuracy did not move at all between them, which is the practically reassuring result — you do not have to talk like a curator to get the right answer. Attribution moves a little, and it is the weak spot.

<!-- include: fig3-citation-type.html -->

Citation F1 is strict, and we want to be transparent about these results. For the deployed model it sits at **0.71 with precise phrasing and 0.68 when the question is asked naturally** — meaning the Assistant reliably reaches the right conclusion while getting roughly a third of its supporting evidence wrong, by citing passages it did not need or omitting ones it did. (Earlier runs of other models spanned 0.64 to 0.77; those are on the [dashboard](https://nf-osi.github.io/kg-pipeline/) but are not what the portal serves.) For comparison, the Google AI overview is accurate 85% to 91% of the time. The takeaway is still to check citations given.

The more actionable finding is *where* attribution breaks down. It is not on the questions we graded hard: citation F1 by difficulty is nearly flat. It varies by paper, and by more than twice as much.

<!-- include: fig4-citation-paper.html -->

A paper at 0.35 and a paper at 0.81 got every answer right. What differs is how cleanly each paper's passages map onto the claim being made — which points at our passage segmentation and at the ground-truth attribution lists, not at the model's reading comprehension. That is a tractable problem, and it is where the next round of work goes.

### Researcher verification

Researchers can test out with these example questions. On the [portal](https://nf.synapse.org), copy-and-paste them into the chat. Each one is a scored benchmark item that the current portal handles badly and the Assistant handles well — one per resource category — so they are also the cases where it is most worth telling us if your experience differs from ours.

<!-- include: table1-high-impact.html -->

### Limitations

Both benchmarks have limitations, some already mentioned. 

Recall on the resource discovery does not penalize over-retrieval, which flatters models that return large sets.

Recall is only comparable *within* a question set. v1.3 is not a harder v0; it adds whole categories, so the scores here should not be read as a trend against the earlier numbers on the dashboard. The dashboard is also selective on purpose: of 52 recorded discovery runs, 36 are development runs over part of a set or runs the harness could not score, and they are excluded from every published figure.

The hardest questions are the thinnest. Only two questions in v1.3 require three hops through the graph, and the Assistant gets 0.50 on them. That is a number to treat as a direction rather than a measurement, and it is the tier we most want to grow.

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

*The pipeline, evaluation datasets, and eval harness are open source: [nf-osi/kg-pipeline](https://github.com/nf-osi/kg-pipeline) and [nf-osi/asta-bench](https://github.com/nf-osi/asta-bench). Full results for every run and every model are on the [evaluation dashboard](https://nf-osi.github.io/kg-pipeline/), published from `evaluation/runs.json` and `evaluation/pubs_runs.json`.*
