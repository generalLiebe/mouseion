# AI印税分配システム仕様書

**バージョン 0.1 - ドラフト**

## 1. 概要

この仕様書は、AIシステムへの貢献を追跡し、全ての参加者に公正に報酬を分配する印税分配システムについて記述します。

### 1.1 対象範囲

本システムがカバーする範囲：
- データ登録とメタデータ管理
- AIが出力を生成する際の貢献者特定
- 報酬計算と分配
- 専門家アノテーションと品質保証
- AIモデルバージョン追跡
- 人間/AIデータ分離

### 1.2 参加者

| 役割 | 説明 |
|:--|:--|
| データ提供者 | 学習データやコンテンツを提供 |
| クリエイター | オリジナル作品を作成 |
| レビュワー | データのアノテーションと評価 |
| AI開発者 | AIモデルの構築と保守 |
| AI利用者 | AIサービスを利用 |
| 専門家 | アノテーションのためのドメインスペシャリスト |
| ガーディアン | 紛争解決のための信頼されたエンティティ |

---

## 2. データ登録

### 2.1 登録メタデータ

```
DataRegistration {
    data_hash: Hash           // データ本体のSHA-256
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

### 2.2 利用条件

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

### 2.3 ストレージアーキテクチャ

| 保存場所 | 内容 |
|:--|:--|
| オンチェーン | メタデータ、ハッシュ、権利情報、貢献記録 |
| オフチェーン | データ本体（IPFS、Arweave） |

**理由**: フルデータのオンチェーン保存はコスト面とプライバシー面で問題がある。

---

## 3. 貢献者特定

### 3.1 アルゴリズム

システムは、貢献データを特定するために複数のアルゴリズムを採用：

#### 3.1.1 意味的類似度

**手法**: Sentence-BERT、コサイン類似度

```
similarity_score = cosine(embedding(output), embedding(data))
```

**用途**: テキストベースコンテンツマッチング

#### 3.1.2 キーワードマッチング

**手法**: TF-IDF、Word2Vec

```
relevance_score = tfidf_match(prompt_keywords, data_keywords)
```

**用途**: プロンプト-データ関連性

#### 3.1.3 パターン認識

**手法**: K-Means、DBSCANクラスタリング

```
cluster_id = cluster(feature_vector(output))
contributing_data = data_in_cluster(cluster_id)
```

**用途**: 特徴ベース分類

#### 3.1.4 RAGベース追跡

**手法**: Retrieval-Augmented Generation

```
retrieved_docs = retrieve(query, top_k=10)
contribution = explicit_references(retrieved_docs)
```

**用途**: 明示的な参照追跡

#### 3.1.5 Attention解析

**手法**: TransformerのAttention Weight

```
attention_scores = extract_attention(model, input)
high_attention_tokens = filter(attention_scores > threshold)
```

**用途**: Transformerモデルの帰属

#### 3.1.6 Influence Functions

**手法**: 勾配ベースの貢献推定

```
influence = gradient_influence(training_sample, model_output)
```

**用途**: 学習データの影響測定

### 3.2 技術的課題

| 課題 | 解決策 |
|:--|:--|
| 計算コスト | 事前インデックス化、ANN（近似最近傍探索） |
| 精度の限界 | マルチメソッドアンサンブル、閾値チューニング |
| リアルタイムvsバッチ | ユースケース依存の選択 |
| ファインチューン済みモデル | 転移学習向け特化追跡 |

---

## 4. 貢献スコアリング

### 4.1 スコア構成要素

```
ContributionScore {
    usage_frequency: Float      // データが参照された回数
    quality_score: Float        // 専門家/コミュニティ評価
    similarity_score: Float     // 出力との関連性
    rarity_factor: Float        // 代替の可用性
}
```

### 4.2 計算式

```
total_score = (usage_frequency × w1) +
              (quality_score × w2) +
              (similarity_score × w3) +
              (rarity_factor × w4)
```

**デフォルト重み**: w1=0.30, w2=0.30, w3=0.25, w4=0.15

重みはガバナンスで調整可能。

### 4.3 品質スコアの情報源

| 情報源 | 重み | 説明 |
|:--|:--|:--|
| 専門家評価 | 高 | ドメイン専門家による評価 |
| コミュニティ評価 | 中 | ピアレビュー |
| 利用メトリクス | 低 | ダウンロード/参照数 |
| アノテーション品質 | 高 | 相互レビュースコア |

---

## 5. 報酬分配

### 5.1 フロー

```
1. AIサービス利用
   └─► ユーザーがサービス料を支払う

2. 貢献追跡
   └─► システムが関連データ提供者を特定

3. スコア計算
   └─► 貢献スコアを計算

4. 分配
   └─► トークンを按分配分

5. 保留型送金
   └─► 基盤チェーン経由で報酬を送金（保留状態）

6. 確認
   └─► 貢献者が受領を確認
```

### 5.2 分配式

```
individual_reward = (contributor_score / total_scores) × reward_pool
```

### 5.3 プール管理

```
RewardPool {
    balance: BigInt
    pending_distributions: BigInt
    last_distribution: Timestamp
    distribution_frequency: Duration
}
```

### 5.4 分配トリガー

| トリガー | 条件 |
|:--|:--|
| 定期 | Nブロックまたは時間間隔ごと |
| 閾値 | プールが最小サイズに達した時 |
| 手動 | ガバナンス起動 |

---

## 6. 専門家アノテーションシステム

### 6.1 審査区分表

専門分野の階層的分類：

```
ClassificationTable {
    academic_fields: [
        { code: "CS", name: "コンピュータサイエンス", subfields: [...] },
        { code: "MED", name: "医学", subfields: [...] },
        ...
    ],
    industry_sectors: [
        { code: "FIN", name: "金融", subfields: [...] },
        ...
    ],
    specialty_tags: [String]
}
```

### 6.2 専門家選定アルゴリズム

```
1. 入力: アノテーションが必要なデータ、分類コード

2. 候補フィルタリング:
   - 分類コードの一致
   - 最低専門性スコアでフィルタ
   - 可用性でフィルタ

3. スコアリング:
   - 過去の貢献スコア (40%)
   - アノテーション品質履歴 (40%)
   - コミュニティ信頼スコア (20%)

4. 選定:
   - 上位N候補を提示
   - 最終選定: AIランキング + コミュニティ投票

5. 割当:
   - 選定された専門家に通知
   - アノテーション期限を設定
```

### 6.3 品質保証

#### 相互レビュー

```
CrossReview {
    annotation_id: UUID
    reviewers: [PublicKey]
    scores: [Score]
    consensus_score: Float
    reliability_index: Float
}
```

#### 信頼性指標

```
reliability = agreement_rate × completeness × timeliness
```

#### 不正検知

| シグナル | アクション |
|:--|:--|
| 継続的に乖離したスコア | 警告 + レビュー |
| 急速な低品質提出 | レート制限 |
| 共謀パターン | 調査 + スラッシング |

---

## 7. AIモデルバージョン管理

### 7.1 バージョンレコード

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

### 7.2 メリット

| メリット | 説明 |
|:--|:--|
| 透明性 | ユーザーが変更内容を確認可能 |
| 安定性 | 特定バージョンを選択可能 |
| 説明責任 | 誰が何を公開したか追跡 |
| ロールバック | 以前のバージョンに戻せる |

### 7.3 変更タイプ

| タイプ | 必要事項 |
|:--|:--|
| パッチ（バグ修正） | 通知 |
| マイナー（機能追加） | 7日間の事前通知 |
| メジャー（破壊的変更） | ガバナンス投票 |

---

## 8. 人間/AIデータ分離

### 8.1 ソースタイプ

```
enum SourceType {
    HUMAN,         // 100%人間作成
    AI_GENERATED,  // 主にAI生成
    AI_ASSISTED    // AI支援付き人間作成
}
```

### 8.2 検証

| 方法 | 説明 |
|:--|:--|
| 自己申告 | 提供者がソースを申告 |
| AI検出 | 自動検出アルゴリズム |
| コミュニティレビュー | ピア検証 |
| 専門家監査 | ランダムな専門家チェック |

### 8.3 インデックス

分離インデックスを維持：
- 人間のみインデックス（AI学習用）
- AI生成インデックス（参照用）
- 混合インデックス（全データ）

### 8.4 学習フィルター

AI学習で指定可能：
```
TrainingFilter {
    allow_human: Boolean
    allow_ai_generated: Boolean
    allow_ai_assisted: Boolean
    min_quality_score: Float
}
```

---

## 9. 連携ポイント

### 9.1 AIサービス連携

```
// AI生成時のWebhook
POST /api/v1/contribution/track
{
    "generation_id": "...",
    "model_version": "...",
    "input_hash": "...",
    "output_hash": "...",
    "timestamp": "..."
}

// 貢献情報を含むレスポンス
{
    "contributions": [
        { "data_id": "...", "score": 0.15 },
        { "data_id": "...", "score": 0.08 },
        ...
    ]
}
```

### 9.2 基盤チェーン連携

可逆送金型ブロックチェーンを以下に使用：
- 保留型報酬送金
- 不正レビューと回復
- ガーディアンベースの紛争解決

---

## 10. ガバナンス連携

### 10.1 ガバナンス可能なパラメータ

| パラメータ | デフォルト | ガバナンス |
|:--|:--|:--|
| スコア重み（w1-w4） | 4.2参照 | 投票 |
| 専門家選定閾値 | 未定 | 投票 |
| 分配頻度 | 週次 | 投票 |
| 最低品質スコア | 0.5 | 投票 |
| 不正ペナルティ率 | 50% | 投票 |

### 10.2 審査区分表の更新

- コミュニティが新カテゴリを提案可能
- 投票承認が必要
- 14日間の議論期間

---

## 11. プライバシー考慮事項

### 11.1 データ提供者のプライバシー

- 公開鍵のみで活動可能（匿名）
- 個人情報はオンチェーンに保存しない
- KYCはオプション（高額操作時に必要）

### 11.2 データプライバシー

- オンチェーンにはハッシュのみ保存
- 実データはオフチェーンストレージに
- アプリケーション層でアクセス制御

---

## 12. 将来の拡張

- マルチモーダル帰属（画像、音声、動画）
- リアルタイムストリーミング帰属
- クロスプロトコル相互運用性
- 高度なプライバシー（ZKPベースの証明）

---

*この仕様書はワーキングドラフトであり、実装経験とコミュニティフィードバックに基づいて変更される可能性があります。*
