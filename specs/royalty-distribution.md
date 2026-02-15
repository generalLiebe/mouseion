# AI Royalty Distribution System Specification

**Version 0.1 - Draft**

## 1. Overview

This specification describes the royalty distribution system that tracks contributions to AI systems and distributes rewards fairly to all participants.

### 1.1 Scope

The system covers:
- Data registration and metadata management
- Contributor identification when AI generates outputs
- Reward calculation and distribution
- Expert annotation and quality assurance
- AI model version tracking
- Human/AI data separation

### 1.2 Participants

| Role | Description |
|:--|:--|
| Data Provider | Provides training data or content |
| Creator | Creates original works |
| Reviewer | Annotates and evaluates data |
| AI Developer | Builds and maintains AI models |
| AI User | Consumes AI services |
| Expert | Domain specialist for annotation |
| Guardian | Trusted entity for dispute resolution |

---

## 2. Data Registration

### 2.1 Registration Metadata

```
DataRegistration {
    data_hash: Hash           // SHA-256 of data body
    provider_pubkey: PublicKey
    ai_training_opt_in: Boolean
    sale_permitted: Boolean
    usage_terms: UsageTerms
    categories: [Category]
    tags: [String]
    source_type: SourceType   // HUMAN | AI_GENERATED | AI_ASSISTED
    created_at: Timestamp
    signature: Signature
}
```

### 2.2 Usage Terms

```
UsageTerms {
    commercial_use: Boolean
    attribution_required: Boolean
    derivative_works: Boolean
    geographic_restrictions: [Region]
    time_limit: Option<Duration>
    custom_terms: String
}
```

### 2.3 Storage Architecture

| Location | Content |
|:--|:--|
| On-chain | Metadata, hashes, rights, contribution records |
| Off-chain | Data bodies (IPFS, Arweave) |

**Rationale**: On-chain storage of full data is cost-prohibitive and creates privacy concerns.

---

## 3. Contributor Identification

### 3.1 Algorithms

The system employs multiple algorithms to identify contributing data:

#### 3.1.1 Semantic Similarity

**Method**: Sentence-BERT, Cosine Similarity

```
similarity_score = cosine(embedding(output), embedding(data))
```

**Use case**: Text-based content matching

#### 3.1.2 Keyword Matching

**Method**: TF-IDF, Word2Vec

```
relevance_score = tfidf_match(prompt_keywords, data_keywords)
```

**Use case**: Prompt-to-data relevance

#### 3.1.3 Pattern Recognition

**Method**: K-Means, DBSCAN Clustering

```
cluster_id = cluster(feature_vector(output))
contributing_data = data_in_cluster(cluster_id)
```

**Use case**: Feature-based classification

#### 3.1.4 RAG-based Tracking

**Method**: Retrieval-Augmented Generation

```
retrieved_docs = retrieve(query, top_k=10)
contribution = explicit_references(retrieved_docs)
```

**Use case**: Explicit reference tracking

#### 3.1.5 Attention Analysis

**Method**: Transformer Attention Weights

```
attention_scores = extract_attention(model, input)
high_attention_tokens = filter(attention_scores > threshold)
```

**Use case**: Transformer model attribution

#### 3.1.6 Influence Functions

**Method**: Gradient-based contribution estimation

```
influence = gradient_influence(training_sample, model_output)
```

**Use case**: Training data impact measurement

### 3.2 Technical Challenges

| Challenge | Solution |
|:--|:--|
| Computation cost | Pre-indexing, ANN (Approximate Nearest Neighbor) |
| Accuracy limits | Multi-method ensemble, threshold tuning |
| Real-time vs batch | Use-case dependent selection |
| Fine-tuned models | Specialized tracking for transfer learning |

---

## 4. Contribution Scoring

### 4.1 Score Components

```
ContributionScore {
    usage_frequency: Float      // How often data was referenced
    quality_score: Float        // Expert/community evaluation
    similarity_score: Float     // Relevance to output
    rarity_factor: Float        // Availability of alternatives
}
```

### 4.2 Calculation Formula

```
total_score = (usage_frequency × w1) +
              (quality_score × w2) +
              (similarity_score × w3) +
              (rarity_factor × w4)
```

**Default weights**: w1=0.30, w2=0.30, w3=0.25, w4=0.15

Weights adjustable via governance.

### 4.3 Quality Score Sources

| Source | Weight | Description |
|:--|:--|:--|
| Expert Evaluation | High | Domain expert assessment |
| Community Rating | Medium | Peer reviews |
| Usage Metrics | Low | Download/reference counts |
| Annotation Quality | High | Cross-review scores |

---

## 5. Reward Distribution

### 5.1 Flow

```
1. AI Service Usage
   └─► User pays service fee

2. Contribution Tracking
   └─► System identifies relevant data providers

3. Score Calculation
   └─► Contribution scores computed

4. Distribution
   └─► Tokens allocated proportionally

5. Pending Transfer
   └─► Rewards sent via base chain (pending state)

6. Confirmation
   └─► Contributors confirm receipt
```

### 5.2 Distribution Formula

```
individual_reward = (contributor_score / total_scores) × reward_pool
```

### 5.3 Pool Management

```
RewardPool {
    balance: BigInt
    pending_distributions: BigInt
    last_distribution: Timestamp
    distribution_frequency: Duration
}
```

### 5.4 Distribution Triggers

| Trigger | Condition |
|:--|:--|
| Periodic | Every N blocks or time period |
| Threshold | Pool reaches minimum size |
| Manual | Governance-initiated |

---

## 6. Expert Annotation System

### 6.1 Classification Table

Hierarchical categorization of expertise areas:

```
ClassificationTable {
    academic_fields: [
        { code: "CS", name: "Computer Science", subfields: [...] },
        { code: "MED", name: "Medicine", subfields: [...] },
        ...
    ],
    industry_sectors: [
        { code: "FIN", name: "Finance", subfields: [...] },
        ...
    ],
    specialty_tags: [String]
}
```

### 6.2 Expert Selection Algorithm

```
1. Input: Data requiring annotation, classification code

2. Candidate Filtering:
   - Match classification code
   - Filter by minimum expertise score
   - Filter by availability

3. Scoring:
   - Past contribution score (40%)
   - Annotation quality history (40%)
   - Community trust score (20%)

4. Selection:
   - Top N candidates presented
   - Final selection: AI ranking + community vote

5. Assignment:
   - Selected experts notified
   - Annotation deadline set
```

### 6.3 Quality Assurance

#### Cross-Review

```
CrossReview {
    annotation_id: UUID
    reviewers: [PublicKey]
    scores: [Score]
    consensus_score: Float
    reliability_index: Float
}
```

#### Reliability Index

```
reliability = agreement_rate × completeness × timeliness
```

#### Fraud Detection

| Signal | Action |
|:--|:--|
| Consistently divergent scores | Warning + review |
| Rapid low-quality submissions | Rate limit |
| Collusion patterns | Investigation + slashing |

---

## 7. AI Model Version Control

### 7.1 Version Record

```
ModelVersion {
    model_id: UUID
    version: String
    training_data_hash: Hash
    parameters_hash: Hash
    changelog: String
    published_at: Timestamp
    publisher: PublicKey
    signature: Signature
}
```

### 7.2 Benefits

| Benefit | Description |
|:--|:--|
| Transparency | Users see what changed |
| Stability | Select specific version |
| Accountability | Track who published what |
| Rollback | Revert to previous version |

### 7.3 Change Types

| Type | Requires |
|:--|:--|
| Patch (bug fix) | Notification |
| Minor (feature) | 7-day notice |
| Major (breaking) | Governance vote |

---

## 8. Human/AI Data Separation

### 8.1 Source Types

```
enum SourceType {
    HUMAN,         // 100% human-created
    AI_GENERATED,  // Primarily AI-generated
    AI_ASSISTED    // Human with AI assistance
}
```

### 8.2 Verification

| Method | Description |
|:--|:--|
| Self-declaration | Provider declares source |
| AI Detection | Automated detection algorithms |
| Community Review | Peer verification |
| Expert Audit | Random expert checks |

### 8.3 Indexing

Separate indices maintained:
- Human-only index (for AI training)
- AI-generated index (for reference)
- Mixed index (all data)

### 8.4 Training Filters

AI training can specify:
```
TrainingFilter {
    allow_human: Boolean
    allow_ai_generated: Boolean
    allow_ai_assisted: Boolean
    min_quality_score: Float
}
```

---

## 9. Integration Points

### 9.1 AI Service Integration

```
// Webhook on AI generation
POST /api/v1/contribution/track
{
    "generation_id": "...",
    "model_version": "...",
    "input_hash": "...",
    "output_hash": "...",
    "timestamp": "..."
}

// Response with contributions
{
    "contributions": [
        { "data_id": "...", "score": 0.15 },
        { "data_id": "...", "score": 0.08 },
        ...
    ]
}
```

### 9.2 Base Chain Integration

Uses reversible transaction blockchain for:
- Pending reward transfers
- Fraud review and recovery
- Guardian-based dispute resolution

---

## 10. Governance Integration

### 10.1 Governable Parameters

| Parameter | Default | Governance |
|:--|:--|:--|
| Score weights (w1-w4) | See 4.2 | Voting |
| Expert selection threshold | TBD | Voting |
| Distribution frequency | Weekly | Voting |
| Minimum quality score | 0.5 | Voting |
| Fraud penalty rate | 50% | Voting |

### 10.2 Classification Table Updates

- Community can propose new categories
- Requires voting approval
- 14-day discussion period

---

## 11. Privacy Considerations

### 11.1 Data Provider Privacy

- Can operate with public key only (pseudonymous)
- Personal information never stored on-chain
- KYC optional (required for high-value operations)

### 11.2 Data Privacy

- Only hashes stored on-chain
- Actual data in off-chain storage
- Access controls at application layer

---

## 12. Future Extensions

- Multi-modal attribution (image, audio, video)
- Real-time streaming attribution
- Cross-protocol interoperability
- Advanced privacy (ZKP-based proofs)

---

*This specification is a working draft and subject to change based on implementation experience and community feedback.*
