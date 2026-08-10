# MethodDka (200次対応 & 50桁高精度多項式解法・因数分解 Web アプリ / Multilingual Polynomial Solver)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.xxxxxxx.svg)](https://doi.org/10.5281/zenodo.xxxxxxx)

[日本語](README.md) | [English](README.md#english-overview)

## 🇯🇵 日本語概要

*MethodDka* は、HTML と JavaScript だけで動作する軽量・高速・超高精度な多項式解法 ＆ 因数分解 Web アプリケーションです。
DKA法（Durand-Kerner 法）を採用し、 Decimal.js による *50桁高精度演算* 、 *最大200次対応オートスケーリング処理* 、 *複素数係数（i, j）の完全対応* 、 *係数一括ペースト機能* 、および *日本語 / English 瞬時言語切替機能* を統合したオールインワン版です。

---

## 🎧 応用例: ハイレゾ対応オーディオ用デジタルチャンネルデバイダー (Audio DSP Application)

### 【New Application: High-Resolution Audio Digital Crossover & Minimum-Phase FIR Filter Design for SONY SS-CS5 Multi-Amp System】

3WAYスピーカー **SONY SS-CS5** の内蔵ネットワーク（コンデンサやコイル等による受動素子の挿入損失や位相歪み）を完全に排除し、極限の高音質化を達成するためのデジタルチャンネルデバイダーを本プロジェクト（MethodDka）の数学的エンジンを用いてオフライン設計します。

7.1チャンネルHDMI接続ハイレゾ配信対応アンプが持つ7chアンプのうち6ch（中古保証付きアンプ）をマルチアンプ駆動へ転用し、デジタルプリアンプとパワーアンプの間に挿入する高精度デジタルフィルターの係数算出に応用します。

### 🛠️ 開発設計の前提条件とスペック・ユースケース
* **OS環境:** Windows 11 Home (25H2)
* **音源・サンプリング周波数:** Amazon Music Unlimited (ハイレゾ配信 24bit / 96kHz)
* **ターゲットスピーカー:** SONY SS-CS5 (3WAYスピーカー・内蔵ネットワーク完全バイパス)
* **ハードウェア構成:** 7.1ch HDMIアンプの6ch流用マルチアンプ駆動（デジタルプリアンプ ～ チャンネルデバイダー ～ パワーアンプ）
* **クロスオーバー周波数 (3-WAY):**
  * **Low / Mid (2.5kHz):** 200タップによる急峻な減衰と、位相のブレない自然な繋がり。
  * **Mid / High (17kHz):** スーパートゥイーターを正確に駆動する高精度フィルタリング。
* **最大のメリット:** パッシブネットワークを排除してアンプが直接ユニットを駆動するドライブ力の向上と、プレエコー（プリリンギング）を極限まで排除する「ミニマムフェーズ化」を、50桁の数学的精度でノーエラーで実行。

---

## 📝 主な機能と特徴

1. **🌐 2か国語対応 (日本語 / English)**
   - 画面右上のボタンをワンクリックするだけで、UIテキスト・案内表示・結果出力表示を即座に日本語と英語に切り替えられます。
2. **📋 係数データの一括ペースト機能（複素数 i, j 対応）**
   - スペース、改行、またはカンマ区切りのテキスト（例: `1, -5.5, 3-4j, 0, 1+2i`）を一括で貼り付けるだけで、実数だけでなく虚数単位 i や j を含む複素数係数も自動解析して全係数へ一発セットできます。
3. **⚡ 最大 200 次高次多項式 ＆ オートスケーリング（規格化）対応**
   - 高次計算時や巨大・極小な係数が混在する場合でも、自動スケーリング処理によってオーバーフロー・アンダーフローを防止し、安定して計算を実行します。
4. **🎯 50 桁高精度解表示 ＆ 因数分解モードの即時切替**
   - 単一画面上で「50桁高精度解表示」と「因数分解表示（小数第1位四捨五入）」をトグルスイッチ一つで即座に切り替え可能です（再計算なし）。
5. **💻 完全マルチプラットフォーム ＆ オフライン対応**
   - サーバー不要で単一の HTML ファイルとして動作するため、Windows, Mac, Linux, iOS, Android, ChromeOS 等のあらゆるブラウザでローカル・オフライン動作します。

---

## 🇬🇧 English Overview

*MethodDka* is a lightweight, ultra-fast, and high-precision web application designed for solving complex polynomials and performing factorization using pure HTML and JavaScript.
Powered by the Durand-Kerner (DKA) algorithm and Decimal.js with *50-digit precision*, it features *auto-scaling normalization up to degree 200*, *full support for complex coefficients using `i` or `j`*, *bulk coefficient input*, and *instant bilingual language switching (English/Japanese)*.

---

## 🌟 Key Features

1. **🌐 Multilingual Support (English / Japanese)**
   - One-click language toggle in the top-right header switches the entire user interface, instructions, and result forms between English and Japanese dynamically.
2. **📋 Bulk Coefficient Input (with Complex i & j Support)**
   - Paste comma or space-separated values including complex numbers like `1+2i` or `3-4j` to fill all coefficient fields instantaneously.
3. **⚡ Auto-Scaling Normalization (Up to Degree 200)**
   - Prevents numerical underflow and overflow when handling high-degree polynomials or extreme variations in coefficient magnitudes.
4. **🎯 Instant Display Toggle (50-Digit Precision & Factored Form)**
   - Effortlessly switch between "50-digit high-precision roots with residuals" and "factored form (rounded display)" without recalculating.
5. **💻 Fully Cross-Platform & Offline Ready**
   - Runs locally on any modern browser (Chrome, Safari, Edge, Firefox, mobile browsers) with no server required.

---

## 🧪 ベンチマーク: 10次ウィルキンソン多項式 / Benchmark: 10th-Degree Wilkinson Polynomial

本アプリの DKA法の特性（悪条件多項式におけるサドルポイントへの引き込み）を検証するためのテストケースとして、*10次のウィルキンソン多項式* $W_{10}(x) = \prod_{i=1}^{10} (x - i)$ を `index.html` に組み込みました。

💡 **補足 / Note (悪条件多項式について / Ill-conditioned polynomials):** 本アプリはオートスケーリング処理により最大200次までの計算に対応していますが、ウィルキンソン多項式のように「根が実軸上に極めて密集して並ぶ悪条件多項式（Ill-conditioned polynomials）」では、並列円周初期値を用いる DKA 法の性質上、高次（10次以上）で複素数領域の鞍点へ引き込まれる（偽収束する）場合があります。通常分散された多項式では高次まで正常に動作します。

### テスト手順 (How to test):
1. ヘルプページ ([help.html](https://github.com/YoshiakiKoizumija142397/MethodDka/blob/main/help.html)) にアクセスします。
2. 「10次ウィルキンソン係数をコピペします。
3. Calculator[MethodDka.html](https://github.com/YoshiakiKoizumija142397/MethodDka/blob/main/MethodDka.html) の「一括ペースト」エリアに貼り付けて計算を実行してください。

---

## 🌐 公式ページ ＆ リポジトリ / Official Links

- **Web アプリ (Live Demo):** [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/)
- **GitHub リポジトリ (Repository):** [MethodDka Repository](https://github.com/YoshiakiKoizumija142397/MethodDka)

---

## 📁 リポジトリの構成 / Repository Structure

```text
MethodDka/
├── help.html              #　ヘルプと１０次ウィルキンソン係数一括読み込み対応データ
├── MethodDka.html         # 統合マスターコード / Multilingual master code
├── index.html             # 公式ランディングページ (ベンチマーク生成機能付き) / Official Landing Page
└── README.md              # 本ドキュメント / Documentation
