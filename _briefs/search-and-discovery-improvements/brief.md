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
assets:
  - name: "nf-osi/kg-pipeline"
    url: "https://github.com/nf-osi/kg-pipeline"
    type: "code"
  - name: "nf-osi/asta-bench"
    url: "https://github.com/nf-osi/asta-bench"
    type: "code"
license:
  name: "CC BY 4.0"
  url: "https://creativecommons.org/licenses/by/4.0/"
---

## Introduction

A researcher can bring different types of questions to the NF Data Portal. Some searches can be considered relatively straightforward: find datasets by this data type, filter studies by both funder and release status, find an animal model for "glioma" research. The search box was already meant to handle those, but our previous search backend (MySQL fulltext search) had shortcomings. Other portal searches aren't really as simple as they might seem, requiring reasoning and synthesis across several sources, or a relationship that doesn't live inside any single field. 

As a case study, a researcher planning an experiment might ask for *validated MPNST cell lines suitable for time-constrained drug screen*. This implies filtering by available attributes such as doubling time (<48 hours) and looking up literature references for "validated". The search box can certainly return a candidate listing of relevant cell lines, but the results might still fall short on fulfilling the requirements and linking to the literature. The user would have to further curate this list with several more "research" steps.

Last quarter we released two major portal upgrades for these different question types: a migration of the portal's search engine to OpenSearch, and the Alpha release AI Portal Assistant backed by a knowledge graph. We had in mind the shopping experience at [REI](https://www.rei.com/), where product search works well on its own, but there's also in-store staff to ask deeper questions and do more research with before committing serious funds. The aim is for the Portal Assistant to get closer to that in-store experience, handling the kind of resource exploration the search box alone cannot.

## OpenSearch

We migrated the portal's search backend from MySQL full-text search to [OpenSearch](https://opensearch.org/), an open-source search and analytics engine meant to serve the majority of searches. For most questions, that means a faster, more forgiving search box. With autosuggest, a researcher can spiffily see potential queries as they start typing. Modern text analyzers and custom synonym configuration mean researchers can use shorthand terms and no longer need perfect spelling or phrasing. And OpenSearch stays fast at scale, [generally getting faster with each new release](https://opensearch.org/blog/opensearch-project-update-performance-progress-in-opensearch-3-0/), meaning a wise infrastructure investment for growing portal data.

Behind the scenes, we can now fine-tune relevance ranking directly, deciding what additional data to index, what to boost, and how to keep improving results over time, control we didn't have with the old MySQL search.

## The Portal Assistant

The Portal Assistant can pull from multiple knowledge sources, some of which are content that OpenSearch currently can't index or link: the NF knowledge graph, help docs, and a limited set of permissibly-licensed portal publications. So you *can* ask a basic help doc question, of course, but we also expect it to serve users better on multi-step or highly-linked resource discovery that require synthesis and reasoning. 

However, before it can serve users, we have to answer the question "Is it trustworthy?" In development and testing, we address this by running evaluations with custom benchmark datasets using our version of [AstaBench](https://github.com/allenai/asta-bench). While we have multiple different evaluations, we focus on explaining the Assistant's expected performance on two evaluations in particular: one for portal search and discovery (with a focus on research tools), and one for literature question-answering accuracy.

Note that the Assistant is based on a selected model, and the harness runs the same benchmarks against several so we can see what we would gain or lose by switching. **Everything reported below is claude-sonnet-5, the model currently serving the Assistant on the portal.** These are therefore the results a researcher can expect today, not the best score we have ever recorded. The full data covering every model and both question sets is published on our [evaluation dashboard](https://nf-osi.github.io/kg-pipeline/), which updates on new evaluations.

### Can it find the right resources?

Our first evaluation is a set of curated discovery questions across nine categories: **mutations**, **animal models**, **cell lines**, **antibodies**, **genetic reagents**, **studies**, **publications and the people behind them**, **investigators**, and **cross-resource** queries. The current set (v1.3) has 46 questions. For each question, we have verified ground truth (a set of resource IDs for the expected relevant results). Each question is also tagged with UX attributes, like whether it's a "hard" question that takes real effort to answer with just the search box or facets, or which type of user it's most relevant to. *Is this new assistant good at things that are currently hard, or only at the things that were already easy?*

For each question, the metric is recall over the expected identifiers. Put simply, recall is the share of the expected resources that actually turn up in the results. The results here are a single run against v1.3 on 2026-08-18: **overall recall 0.80 (± 0.05)**.

Difficulty does indeed affect accuracy. Questions the curators marked "baseline" (answerable today with some patience on the portal) score 0.96. The "advanced" ones score 0.70.

<!-- include: fig1-portal-pain.html -->

The Assistant outperforms search because it can reach pre-connected resources through the knowledge graph that a keyword search cannot see. If the Assistant were only good at what search is already good at, the line would fall off a cliff at the right-hand end. Instead, on the twenty questions rated *very high* pain (the ones a curator judged unanswerable on today's portal, or answerable only through expert workarounds most users would never find), it still returns two thirds of the expected resources. Put the other way, 16 of the 27 questions rated hard or impossible on the current portal were answered perfectly.

But the below figure shows where it falls short. Animal models are the soft spot, at 0.58. The two categories added in v1.3 also sit low, which is what we would expect from categories the pipeline has had the least time to model. And the two perfect scores carry the least weight: Antibody rests on three questions and Investigator on two, which is why Figure 2 prints *n* on every bar rather than letting a full-length bar imply a settled result.

<!-- include: fig2-category.html -->


### Can it be trusted about the literature?

The Portal Assistant was funded in some part because researchers were interested in a "chat with papers" feature. Currently, the Assistant can answer questions on 138 publications listed on the portal; publications are included only if they have permissive licenses, then prioritized by relevance to NF Tools Central in our initial alpha-phase scope. Our target accuracy of at least 95% was achieved, but citation capabilities could be improved. Accuracy measures how often the model selects the correct answer from a set of choices, which requires retrieving and understanding the right passage of the paper. Citation is scored with F1, measuring whether the model cited the exact references expected for the answer (papers have numbered passages to make it easier to validate). Both metrics were measured on our "Pub RAG" benchmark of 130 multiple-choice questions from 14 of the papers (about 10% of the total corpus), the same format used by well-known benchmarks [LitQA2](https://huggingface.co/datasets/futurehouse/lab-bench/viewer/LitQA2) and Humanity's Last Exam. Items were originally generated by diverse frontier models against full text, then reviewed and edited by the NF-OSI team.

Curation for this benchmark can be tricky, so it's not a perfect benchmark. As a pertinent example, an earlier version of Humanity's Last Exam was found to have roughly 30% of its text-only chemistry and biology questions in conflict with the peer-reviewed record. We had to resolve similar issues such as conflicts were between papers: two indexed papers report NF1 population incidence as 1:2000 and 1:2500, so a question asking for "the" incidence had no correct answer and was dropped. Where a fact was merely ambiguous rather than contradictory, the question could be made more specific instead of removed entirely.

Other problems were internal to individual questions. Generated ideal answers sometimes cited mutation variants that never appeared anywhere in the source paper, thus every ideal answer was checked against the text. Some questions were too loosely anchored to be answerable: "What was the CS in the eyeblink conditioning experiments?" doesn't work when the corpus contains more than one such experiment, so these were rewritten to anchor more specifically to a study or section. The evaluation doesn't tell the model which paper to read, reflecting real-world retrieval conditions where finding the right paper is part of the task. Finally, trivial items were dropped, where questions answerable without retrieval, or paired with implausible distractors, since they only inflate scores without adding information.

Accuracy is **100%** (130 of 130, under both phrasings), which may make this a too-easy evaluation. But it does suggest that the Assistant should be able to answer questions accurately from its current collection of papers.

We actually ran every question two ways: phrased with the exact terminology of the paper, and phrased the way a user would actually ask in more informal language. Accuracy did not differ much between them. Practically, that means you do not have to use the paper's terminology to get the right answer. On the other hand, attribution differs a little, and it is the weak spot.

<!-- include: fig3-citation-type.html -->

Citation F1 is strict by design. It penalizes both over-citing and under-citing, rather than just checking whether at least one correct reference showed up. For the deployed model it sits at **0.71 with precise phrasing and 0.68 when the question is asked naturally**. In practice, the Assistant reliably reaches the right conclusion while getting nearly a third of its supporting evidence wrong, citing "irrelevant" passages it did not need or omitting ones it did. For comparison, [Google AI overviews are accurate 85% to 91% of the time](https://www.nytimes.com/2026/04/07/technology/google-ai-overviews-accuracy.html). The takeaway is still to check citations.

The more actionable finding is *where* attribution breaks down. It varies by paper, and by more than twice as much.

<!-- include: fig4-citation-paper.html -->

A paper at 0.35 and a paper at 0.81 got every answer right. What differs is how cleanly each paper's passages map onto the claim being made. This does suggest reviewing curated citations to understand what's different between what we think should be cited vs what the agent thinks should be cited. 

### Community testing

Researchers can test out with these example questions. On the [portal](https://nf.synapse.org), copy-and-paste them into the chat. Each one is a scored benchmark item that the current portal handles badly and the Assistant handles well, one per resource category.

<!-- include: table1-high-impact.html -->

### Limitations

Both benchmarks have limitations, some already mentioned. 

Recall on the resource discovery does not penalize over-retrieval, which flatters models that return large sets. Recall is only comparable *within* a question set. v1.3 is not a harder v0; it adds whole categories, so the scores here should not be read as a trend against the earlier numbers on the dashboard. The dashboard is also selective on purpose: of 52 recorded discovery runs, 36 are development runs over part of a set or runs the harness could not score, and they are excluded from every published figure.

The Pub QA is small because of the human curation. The question set has had one round of expert review, not the several we would prefer. It's also narrow in scope. Questions require synthesis across passages within a paper, but never across papers, which we consider a harder tier and a promising sequel to this dataset. Ground-truth attribution lists are hard to finalize, too, so citation F1 carries some irreducible noise from the ground truth itself, not just from the model.

## How the community can collaborate

We see the Assistant as something the community should help shape. The ability to answer "Whether it is trustworthy?" depends on having benchmark questions, and we could always use larger and improved benchmarks developed with the help of NF experts and portal users. 

One first part is having more people to sit down and think about what are meaningful questions to even include. In particular, the Assistant might not seem trustworthy when it is not using the same reasoning that we use and expect, and that's another area that would benefit from NF expert input. 

Portal users can also help provide evaluation and feedback. If you have a resource-discovery question the portal handles poorly today, whether or not the Assistant does any better, let us know. 

Lastly, we're even open to community naming suggestions for something other than "Portal Assistant"!

If you'd like to collaborate, contact nfosi@sagebionetworks.org.

## Acknowledgements

This work was made possible with funding from the [Gilbert Family Foundation](https://gilbertfamilyfoundation.org/).
