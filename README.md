# MethodDka (200次対応 & 最大200桁高精度多項式解法・因数分解 Web アプリ / Multilingual Polynomial Solver)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.xxxxxxx.svg)](https://doi.org/10.5281/zenodo.xxxxxxx)
![Version](https://img.shields.io/badge/version-v3.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

[日本語](README.md) | [English](#-english-overview)

---

## 🇯🇵 日本語概要

*MethodDka* は、HTML と JavaScript だけで動作する軽量・高速・超高精度な多項式解法 ＆ 因数分解 Web アプリケーションです。

DKA法（Durand-Kerner-Aberth 法）を採用し、`Decimal.js` による **ダイレクト200桁極限高精度演算** を完全統合しました。最新の v3.2.0 では、最初から200桁固定精度で直接多項式評価を行うダイレクトエンジンとリアルタイム進捗 UI（ループ数・経過時間・残り推定時間・誤差半径トラッキング）を実装し、20次および65次ウィルキンソン多項式などの超悪条件多項式も誤差 $10^{-150} \sim 10^{-186}$ オーダーの極限精度へ完全収束させます。

---

## 📋 システム仕様 (Technical Specifications)

| 項目 | 詳細仕様 |
| :--- | :--- |
| **コア解法** | DKA法 (Durand-Kerner-Aberth Simultaneuous Root-Finding Method) |
| **演算精度** | 200桁固定精度 (Decimal.js 内部精度の完全適用) |
| **数値安定化** | **オートスケーリング処理** (最高次係数 $a_n$ による正規化でオーバーフロー・アンダーフローを自動防止) |
| **初期値配置** | Aberth 初期配置 (円周上の非等間隔複素配置) |
| **対応最高次数** | 最高 200 次 ($n \le 200$) |
| **多項式評価** | ホーナー法 (Horner's Method) による高精度多項式直評価 |
| **セーフティロック** | **最大 20,000 回ループ制限** (無駄なループやブラウザフリーズを徹底排除し、到達時点の解と各誤差半径を安全に確実出力) |
| **収束判定閾値** | 誤差半径 $\Delta z_i \le 10^{-150}$ での自動終了 |
| **結果処理** | 実部昇順ソート、複素数表記 ($a + bi$)、誤差半径トラッキング |
| **動作環境** | 完全クライアントサイド（HTML5 / JavaScript ES6+） |

---

## 🚀 主な機能と特徴 (v3.2.0)

1. **ダイレクト 200 桁演算エンジン ＆ オートスケーリング**:
   - 最初から 200 桁固定精度で直接評価を実施。オートスケーリング処理により桁落ちやオーバーフロー・アンダーフローを防ぎ、悪条件な高次多項式も高速・確実に収束。
2. **セーフティロック最適化 (20,000 回制限)**:
   - 無駄なループを徹底的に排除し、20,000 回の安全上限を設定することで PC や端末の負荷を最適化。常にその時点での最新解と正確な誤差半径を出力します。
3. **リアルタイム進捗 ＆ タイマー UI**:
   - 反復ループ進捗率（%）、経過時間（`hh:mm:ss`）、推定残り時間、完全収束数をリアルタイムに画面描画。
4. **自動ソート ＆ 見やすい表示**:
   - 算出された複素解を実部の昇順（`1, 2, 3 ...`）へ自動整列。
5. **柔軟な一括ペースト機能**:
   - 降順（$a_n \dots a_0$）で並んだ係数データをカンマ・空白区切りで一括入力可能。
6. **複素数係数（i, j）の完全対応**:
   - 複素数を含む多項式もそのまま計算可能。
7. **日本語 / English 瞬時言語切替**:
   - ワンクリックで UI を切替可能。
8. **完全オフライン対応・プライバシー保護**:
   - サーバー不要、外部送信なし、単一 HTML で全ブラウザ動作。

---

## ⏱ 動作パフォーマンス ＆ 推奨動作環境（実測値）

**【PC環境（Windows 11 Home / 第8世代 Intel Core i7 / 16GB RAM）】**
- **20次ウィルキンソン多項式 $W_{20}(x) = \prod_{i=1}^{20} (x - i)$**:
  - **総計算時間**: **00:00:01 (わずか 1 秒)**
  - **総反復回数**: **32 回**
  - **最悪誤差半径**: **$2.532316 \times 10^{-186}$ (186桁の極限精度)**
  - **結果**: 全20解（`1.000...` 〜 `20.000...`）が100桁以上の表示桁すべてで完全一致・完全収束。
- **65次ウィルキンソン多項式 $W_{65}(x) = \prod_{i=1}^{65} (x - i)$**:
  - **総計算時間**: **約 4 時間**
  - **最悪誤差半径**: **$10^{-150}$ オーダー (150桁の極限精度)**
  - **結果**: 巨大な係数・桁差を持つ超難問である 65次多項式においても、200桁ダイレクト演算により全65解（`1.000...` 〜 `65.000...`）を極限精度で完走・完全収束することを確認済み。

**【スマートフォン環境（Android / iOS / 例: Galaxy A25 5G等）】**
- **20次多項式**: 快適に動作・高速計算可能。
- **65次多項式**: 演算負荷・計算時間が非常に高いため **非推奨**（PCブラウザでの実行を推奨）。

---

## 🎧 応用例: ハイレゾ対応オーディオ用デジタルチャンネルデバイダー

本アプリの数学的エンジンは、3WAYスピーカー **SONY SS-CS5** のネットワークを完全バイパスし、マルチアンプ駆動へ転用するための高精度FIRフィルター設計に応用されています。最高200桁の数学的精度により、位相歪みを排除したプレエコーのない「ミニマムフェーズ化」をノーエラーで実行可能です。

---

## 🧪 テスト手順

1. [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/) にアクセス。
2. ウィルキンソン係数データを「係数一括ペースト」欄へ貼り付けて「一括反映」をクリック。
3. 「🚀 200桁高精度計算開始！」ボタンを押下。

---

## 🇬🇧 English Overview

*MethodDka* is a lightweight, ultra-fast, and high-precision web application for solving polynomials and factorization using the Durand-Kerner-Aberth (DKA) method powered by `Decimal.js`.
The v3.2.0 update introduces a **Direct 200-Digit Precision Engine** with Auto-scaling and a 20,000-iteration Safety Lock mechanism. Real-time progress UI tracks loop counts, elapsed/remaining time, and error radii, achieving extreme precision ($10^{-186}$ order in 1 sec / 32 iterations for Degree 20; $10^{-150}$ order in approx. 4 hours for Degree 65). (Note: Degree 20 is fully supported on mobile devices like Galaxy A25 5G; Degree 65+ is recommended for PC/Desktop environments with 16GB RAM).

---

## 🌐 公式ページ ＆ リポジトリ

- **Web アプリ (Live Demo):** [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/)
- **GitHub リポジトリ:** [MethodDka Repository](https://github.com/YoshiakiKoizumija142397/MethodDka)

---

## 📁 リポジトリの構成

```text
MethodDka/
├── privacy.html      # プライバシーポリシー
├── MethodDka.html    # 統合マスターコード (v3.2.0 / 200桁ダイレクト演算エンジン)
├── index.html        # ランディングページ (v3.2.0)
├── help.html         # ヘルプページ (v3.2.0)
└── README.md         # ドキュメント (v3.2.0)

```

---

## 📜 ライセンス ＆ 開発者情報

* **開発者**: 小泉嘉章 (Yoshiaki Koizumi)
* **ライセンス**: MIT License

```

---
