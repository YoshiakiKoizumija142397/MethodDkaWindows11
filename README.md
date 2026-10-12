# MethodDka (最大200次対応・260桁内部演算／最大200桁形式出力の多項式数値解法 Web アプリ)

[日本語](https://www.google.com/search?q=README.md) | [English](https://www.google.com/search?q=%23-english-overview)

---

## 🇯🇵 日本語概要

*MethodDka* は、HTML と JavaScript だけで動作する多項式数値解法・因数分解 Web アプリケーションです。内部演算には Decimal.js の260桁精度を用い、実部は有効数字200桁、虚部は $10^{-200}$ の単位で四捨五入して表示します。この表示桁数は正しい有効桁数を保証しません。

DKA法（Durand-Kerner-Aberth 法）を採用し、`Decimal.js` による **260桁内部演算** を行います。実部は有効数字200桁、虚部は $10^{-200}$ の単位で四捨五入して表示します。表示桁数は正しい桁数を保証しません。20次ウィルキンソン多項式の既知根 1〜20 とのベンチマーク照合では、ある検証実行の実部がおよそ247〜258桁一致しました。この結果は当該ベンチマークでの確認であり、他の入力や実行への精度保証ではありません。**v3.4.0** ではユンの平方無因子分解を導入。整数係数はBigIntによる厳密演算で、それ以外の係数は320桁（$\epsilon = 10^{-220}$）で処理し、異なる重複度を持つ根を重複度ごとの平方無因子多項式 $Q_k(x)$ に分離します。検証済みの各因子を既存のDKAエンジンへ個別に渡し、重複度で重み付けした次数の再構成を検査します。検証に失敗した場合は診断ログを表示して元の多項式へフォールバックします。

---

## 📋 システム仕様 (Technical Specifications - v3.4.0)

| 項目 | 詳細仕様 (v3.4.0 拡張) |
| --- | --- |
| **コア解法** | DKA法 (Durand-Kerner-Aberth Simultaneous Root-Finding Method) |
| **演算精度階層** | **階層型マルチプレシジョン設計**<br>・前処理フェーズ: 整数係数は **BigInt厳密演算**、その他は **320桁固定精度** ($\epsilon = 10^{-220}$)<br>・後工程ソルバー: **260桁内部演算 / 最大200桁形式で出力**（60桁のガード桁、スケール後の補正量閾値 $\epsilon = 10^{-220}$。出力桁数は正しい有効桁数を保証しません） |
| **精度の解釈** | 実部は有効数字200桁、虚部は $10^{-200}$ の単位で四捨五入して出力します。これは表示形式であり、正しい有効桁数の保証ではありません。20次ウィルキンソン多項式との照合結果はそのベンチマークに限った数値確認です。正規化残差は後退誤差の数値指標です。例えば残差 $10^{-307}$ は「根が307桁正しい」ことを意味せず、有効桁数を認証するものでもありません。 |
| **自動前処理 (GCD)** | **ユンの平方無因子分解 (Yun's Square-free Decomposition)**<br>・微分多項式 $P'(x)$ とのユークリッド互除法による $\gcd(P, P')$ の算出<br>・整数係数ではBigInt擬似剰余列を使った厳密GCD、それ以外では320桁精度と動的多項式除算 (`polyDivide`) を用いて重複度別の平方無因子群 $Q_k(x)$ を抽出<br>・重複度 $m$ の自動計算と結果の展開処理 |
| **セーフティガード機構** | 各多項式除算の余り、因子の平方無因子性、重複度を反映した再構成次数を検証。失敗時は診断ログを出して元多項式をDKAへ渡す。 |
| **数値安定化** | 非整数係数の前処理と各DKA因子をそれぞれモニック化し、Fujiwara根上界に基づく変数スケール $x=S y$ を適用 |
| **初期値配置** | スケール済み変数 $y$ の円周上にAberth初期値を配置 |
| **対応最高次数** | 最高 200 次 ($n \le 200$) |
| **多項式評価** | ホーナー法 (Horner's Method) による高精度多項式直評価 |
| **セーフティロック** | 反復上限の既定値は因子ごとに **5,000回**（入力欄で10〜50,000回に設定可能）。上限到達時はその時点の解と最終補正量を出力 |
| **結果処理** | 実部昇順ソート、複素数表記 ($a + bi$)、重複度表示、DKA最終補正量、各根の正規化残差、全根からの係数再構成残差を表示。反復収束と検査結果を別々に報告します（数値検査であり数学的証明ではありません）。 |
| **動作環境** | 計算はクライアントサイド（HTML5 / JavaScript ES6+）。計算画面は高精度演算ライブラリ `Decimal.js` をCDNから読み込むため、未キャッシュ時の読み込みにはネットワーク接続が必要。任意のGemini Pro解説にもネットワーク接続が必要 |

---

## 🚀 主な機能と特徴 (v3.4.0)

1. **ユンの平方無因子分解**:
* 整数係数はBigIntによる厳密なGCD・多項式除算で、それ以外は320桁精度と $\epsilon = 10^{-220}$ で処理し、同じ重複度を持つ根の因子群 $Q_k(x)$ を分離します。各群の平方無因子性と元の次数の再構成を検証します。


2. **動的トラッキング型多項式長除法**:
* 歯抜けの多項式や次数が激しく変動する演算過程においても、常に最高次数を監視し次数差 (`shift`) を動的に計算して商の正しい位置に係数を書き込む最強の除算アルゴリズムを実装。インデックスのズレを永久に追放。


3. **検証付きフォールバック**:
* 割り算の余り、平方無因子性、再構成次数のいずれかが検証を通らない場合は診断をログへ出し、元多項式を既存DKAへ渡します。正常に分解できた混在重根は重複度別に個別計算します。


4. **オートスケーリング付きDKA**:
* 非整数係数の前処理と各平方無因子因子のDKAで、Fujiwara上界 $S=2\max_i |a_i|^{1/i}$ を使って $x=S y$ に変数変換します。因子分解後は因子を元の変数へ戻し、DKAは各因子を再スケールして解き、根と最終補正量を元の尺度へ戻します。補正量は真の誤差を保証するものではなく、スケーリングも全ての多項式の収束を保証するものではありません。


5. **Pro デバッグアナライザ (内部可視化モード)**:
* 前処理の全ステップ（入力 $P(x)$、微分 $P'(x)$、GCD $G(x)$、縮約式 $Q(x)$、余り最大値、重複度判定）を画面上の専用黒背景パネルにリアルタイムダンプし、開発・検証を強力にサポート。


6. **リアルタイム進捗 ＆ タイマー UI**:
* 反復ループ進捗率（%）、経過時間（`hh:mm:ss`）、推定残り時間、完全収束数をリアルタイムに画面描画。


7. **柔軟な一括ペースト機能 ＆ 多言語対応**:
* 降順（$a_n \dots a_0$）係数のカンマ・空白区切り一括ペースト、および日本語 / English の瞬時言語切替に対応。


8. **クライアントサイド計算・プライバシー保護**:
* 多項式計算はブラウザー内で実行。Gemini解説を利用しない限り、係数や計算結果を外部へ送信しません。

9. **Gemini Proによる任意のAI解説**:
* 計算結果を日本語または英語で解説。利用者が実行した場合のみ係数と解をGoogle Gemini APIへ送信し、APIキーは送信時に入力欄から消去して保存しません。



---

## ⏱ 動作パフォーマンス ＆ 推奨動作環境（実測例）

**【検証環境（Windows 11 Home / 第8世代 Intel Core i7 / 16GB RAM）】**

* **重根テストケース $(x^2+1)^2 = 0$ ($x^4 + 2x^2 + 1 = 0$)**:
* **前処理**: 整数係数をBigIntで厳密に処理し、一瞬で GCD = $x^2+1$、重複度 2 を検出。
* **総計算時間**: **< 0.01 秒 (一瞬)**
* **結果**: 4つの解（$+i, +i, -i, -i$）を取得。表示する補正量はDKAの最終反復補正であり、真の誤差の保証ではありません。


* **20次ウィルキンソン多項式 $W_{20}(x) = \prod_{i=1}^{20} (x - i)$**:
* **v3.4.0 実測例（1回の実行）**: 上記検証環境での経過時間 **00:00:07**、因子反復合計 **110回**、反復収束 **20/20**、正規化残差チェック（$\le 10^{-180}$） **20/20**、係数再構成誤差 **$2.8046 \times 10^{-247}$**。最大の最終補正量（推定）は **$2.5735 \times 10^{-246}$**（解16）でした。
* **50次ウィルキンソン多項式 $W_{50}(x) = \prod_{i=1}^{50} (x - i)$**:
* **v3.4.0 実測例（1回の実行）**: 上記と同じ検証環境で、経過時間 **00:01:56**、因子反復合計 **308回**、反復収束 **50/50**、正規化残差チェック（$\le 10^{-180}$） **50/50**、係数再構成誤差 **$2.2324 \times 10^{-220}$** でした。
* **100次ウィルキンソン多項式 $W_{100}(x) = \prod_{i=1}^{100} (x - i)$**:
* **v3.4.0 実測例（反復上限1,000回での1回の実行）**: 経過時間 **00:29:52**、因子反復合計 **1,000回**。反復収束は **22/100（22%）**で、全解の反復収束には至りませんでした。一方、正規化残差チェックは **100/100** 合格し、係数再構成誤差は **$2.1544 \times 10^{-186}$**（判定閾値 $\le 10^{-180}$）でした。
* **同じハードウェアでの追加実測（反復上限5,000回、1回の実行）**: 経過時間 **01:55:12**、因子反復合計 **5,000回**。反復収束判定は **23/100（23%）**で全根の判定条件には達しませんでした。一方、正規化残差チェックは **100/100** 合格し、多項式係数再構成誤差も **$1.1202 \times 10^{-187}$**（判定閾値 $\le 10^{-180}$）で合格しました。この実行では根集合と入力多項式の数値的整合性が確認されましたが、反復収束判定の未達を「全根の収束」とみなすことや、真の根の正しさ・誤差を保証するものではありません。
* 時間・反復回数・補正量は環境や実行ごとに変動します。最終補正量と残差・係数再構成誤差は数値指標であり、真の誤差や表示された桁の正しさを保証するものではありません。



---

## 🎧 応用例: ハイレゾ対応オーディオ用デジタルチャンネルデバイダー

本アプリの数値計算エンジンは、3WAYスピーカー **SONY SS-CS5** のネットワークをバイパスし、マルチアンプ駆動へ転用するFIRフィルター設計への応用例があります。出力桁数や残差は正しい有効桁数・誤差の保証ではないため、設計用途では独立した検証と実機での安全確認が必要です。

---

## 🧪 テスト手順

1. [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/) にアクセス。
2. 重根テスト用係数（例: `1, 0, 2, 0, 1`）やウィルキンソン係数を「係数一括ペースト」欄へ貼り付けて「一括反映」をクリック。
3. 「🚀 高精度数値計算開始！」ボタンを押下し、Proアナライザのログと計算結果を確認。
4. Gemini解説を試す場合は、計算結果欄で自分のGemini APIキーを入力して解説を依頼します。依頼時に係数と計算結果がGoogleへ送信されます。

---

---

# 📄 ソフトウェア開発要求仕様書 (SRS: Software Requirements Specification)

**プロジェクト名**: MethodDka (v3.4.0)
**文書種別**: システム要件定義・設計仕様書

## 1. 概要と開発目的

本仕様書は、Webブラウザー上で動作する最高200次・260桁内部演算の多項式数値解法システム *MethodDka* v3.4.0 の機能要件、非機能要件、およびアーキテクチャ設計を定義する。実部は有効数字200桁、虚部は $10^{-200}$ の単位で四捨五入して表示します。表示桁数は正しい有効桁数の保証ではありません。20次ウィルキンソン多項式の既知根とのベンチマーク照合では、検証した実行で実部が約247〜258桁一致しました。この結果は当該テストに限った確認です。v3.4.0ではユンの平方無因子分解を導入し、整数係数はBigIntで厳密に、それ以外は320桁・$\epsilon=10^{-220}$ で処理します。異なる重複度を持つ根を平方無因子因子群へ分けて、既存DKAエンジンで個別に解きます。

## 2. システムアーキテクチャ ＆ 精度階層設計

本システムは、前処理と後工程の間で明確な精度ギャップ（Precision Hierarchy）を設けた2段階パイプライン構造を採用する。

1. **前処理フェーズ (Pre-processing Pipeline)**
* **演算精度**: 整数係数はBigInt厳密演算、それ以外は `Decimal.set({ precision: 320 })`
* **閾値仕様**: 整数係数は厳密割り切れ性、それ以外は $\epsilon = 10^{-220}$
* **主要機能**:
* 整数係数はBigInt擬似剰余GCDと厳密多項式除算によるユン分解
* 非整数係数は微分多項式生成 (`derivativePoly`)、ユークリッド互除法 (`polyGCD`)、動的多項式除算 (`polyDivide`) によるユン分解
* 重複度 $k$ 別の平方無因子因子 $Q_k(x)$ の抽出
* 割り算の余り、平方無因子性、重み付き再構成次数の検証




2. **後工程ソルバーフェーズ (DKA Engine Pipeline)**
* **演算精度**: `Decimal.set({ precision: 260 })` (出力 200有効桁、60ガード桁)
* **閾値仕様**: スケール空間の補正量 $\epsilon = 10^{-220}$
* **主要機能**: 前処理で検証された各平方無因子因子 $Q_k(x)$ を一つずつ既存のDurand-Kerner-Aberth法へ渡し、計算結果を重複度 $k$ に従って展開・統合する。分解検証に失敗した場合はログを出して元多項式を渡す。



## 3. 前処理モジュール詳細設計

### 3.1 動的トラッキング型多項式長除法 (`polyDivide`)

* 降順配列 `[a_n, ..., a_0]` において、次数差 `degA - degB` に基づき、除算の各ステップで正確に商の係数配列 `Q` の正しいインデックス位置へ係数を書き込む。
* 途中で係数が 0 に収束するケースでも、配列の破綻を防ぐために `trimLeadingZeros` による動的トリミングを常時実行する。

### 3.2 堅牢なユークリッド互除法 (`polyGCD`)

* 割る数 $B_{curr}$ の次数が 0 になるか、または余りの最大絶対値が $\epsilon = 10^{-220}$ 以下に達するまでループを実行。
* 割り切れた瞬間の「割る数（$B_{curr}$）」を真の最大公約多項式 $G(x)$ として厳密に返却する。

### 3.3 ユン分解の検証とフォールバック機構

* 各因子の除算余りが $\epsilon$ 以下であること、因子とその導関数のGCDが定数であることを検証する。
* $\sum_k k \cdot \deg(Q_k) = \deg(P)$ および残余GCDが定数であることを検証する。
* 検証に失敗した場合は診断ログを表示し、元多項式をDKAエンジンへ引き渡す。混在重根を次数比で拒否しない。

## 4. ユーザーインターフェース (UI) 要件

* **Pro デバッグアナライザ**: 内部処理の各ステップ（入力、微分、GCD、縮約式、余り、重複度）を構造化テキストとして画面上にトグル表示。
* **リアルタイム進捗パネル**: 反復ループ回数、経過時間、進捗率プログレスバーを動的描画。
* **多言語対応**: 日本語および英語の瞬時切替機能。

---

## 🇬🇧 English Overview (v3.4.0)

*MethodDka* is a high-precision polynomial solver powered by the Durand-Kerner-Aberth (DKA) method and `Decimal.js`. Version 3.4.0 adds Yun's square-free decomposition, using exact BigInt arithmetic for integer coefficients and 320-digit preprocessing ($\epsilon = 10^{-220}$) otherwise. It separates factors by root multiplicity before passing each verified square-free factor to the existing DKA engine. Factor square-freeness and reconstructed degree are checked; failed validation is logged and falls back to solving the original polynomial.

---

## 🌐 公式ページ ＆ リポジトリ

* **Web アプリ (Live Demo):** [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/)
* **GitHub リポジトリ:** [MethodDka Repository](https://github.com/YoshiakiKoizumija142397/MethodDka)

---
## 📜 ライセンス ＆ 開発者情報

* **開発者**: 小泉嘉章 (Yoshiaki Koizumi)
* **バージョン**: v3.4.0
* **ライセンス**: MIT License

  
# MethodDka (Up to Degree 200, 260-Digit Internal Arithmetic, Up to 200-Digit-Format Output; Correct Digits Not Guaranteed)

[日本語](https://www.google.com/search?q=README.md) | [English](https://www.google.com/search?q=%23-english-overview)

---

## 🇬🇧 English Overview

*MethodDka* is a polynomial numerical solver and factorization web application operating on HTML and JavaScript. It uses 260-digit internal arithmetic, displays the real part to 200 significant digits, and rounds the imaginary part to the nearest $10^{-200}$. Output length does not guarantee correct significant digits. In a tested degree-20 Wilkinson benchmark against the known roots 1–20, real parts agreed to approximately 247–258 digits; this validates that benchmark run only, not other inputs or executions.

It uses the DKA method (Durand-Kerner-Aberth) with **260-digit internal arithmetic** powered by `Decimal.js`. The real part is displayed to 200 significant digits, while the imaginary part is rounded to the nearest $10^{-200}$ and shown with 200 decimal places. Output length does not guarantee correct digits. In a tested degree-20 Wilkinson benchmark against the known roots 1–20, real parts agreed to approximately 247–258 digits; this validates that benchmark run only, not other inputs or executions. Version 3.4.0 adds **Yun's square-free decomposition**, using exact BigInt arithmetic for integer coefficients and 320-digit preprocessing ($\epsilon = 10^{-220}$) otherwise. It separates roots with different multiplicities into square-free factors $Q_k(x)$ and sends each verified factor to the existing DKA engine. Factor square-freeness and reconstructed degree are validated; failures are logged and fall back to the original polynomial.

---

## 📋 System Specifications (Technical Specifications - v3.4.0)

| Item | Detailed Specifications (v3.4.0 Expansion) |
| --- | --- |
| **Core Solver** | DKA Method (Durand-Kerner-Aberth Simultaneous Root-Finding Method) |
| **Arithmetic Precision Hierarchy** | **Hierarchical Multi-precision Design**<br>・ Preprocessing Phase: **Exact BigInt arithmetic** for integer coefficients; otherwise **fixed 320-digit precision** ($\epsilon = 10^{-220}$)<br>・ Post-process Solver: **260-digit internal precision / output formatted to at most 200 significant digits** (60 guard digits; scaled correction threshold $\epsilon = 10^{-220}$; output length does not guarantee correct digits) |
| **Automatic Preprocessing (GCD)** | **Yun's Square-free Decomposition**<br>・ Calculation of $\gcd(P, P')$ using the Euclidean algorithm with derivative polynomial $P'(x)$<br>・ Extraction of multiplicity-specific square-free factors $Q_k(x)$ using exact BigInt pseudo-remainder sequences for integer coefficients, or 320-digit arithmetic and dynamic polynomial division (`polyDivide`) otherwise<br>・ Automatic calculation of multiplicity $m$ and result expansion processing |
| **Safety Guard Mechanism** | Validates division remainders, square-freeness of each factor, and reconstructed degree. On failure, logs diagnostics and passes the original polynomial to DKA. |
| **Numerical Stabilization** | Non-integer preprocessing and each DKA factor are scaled independently with $x=S y$, using a Fujiwara root bound |
| **Initial Value Placement** | Aberth initial values are placed on a circle in the scaled variable $y$ |
| **Supported Maximum Degree** | Up to 200th degree ($n \le 200$) |
| **Polynomial Evaluation** | High-precision direct polynomial evaluation via Horner's Method |
| **Safety Lock** | Default limit of **5,000 iterations per factor** (configurable from 10 to 50,000 in the input); outputs the current roots and final correction magnitudes when the limit is reached |
| **Result Processing** | Real part ascending sort, complex number notation ($a + bi$), multiplicity display, final DKA correction, per-root normalized residual, and coefficient reconstruction residual from the full root set; convergence and checks are reported separately (numerical checks, not a proof) |
| **Operating Environment** | Calculations run client-side (HTML5 / JavaScript ES6+). The calculation page loads `Decimal.js` from a CDN, so an internet connection is required unless the library is cached; optional Gemini Pro explanations also require an internet connection |

---

## 🚀 Key Features & Highlights (v3.4.0)

1. **Yun Square-Free Decomposition**:

* Exact BigInt GCD and division are used for integer coefficients; otherwise 320-digit precision and $\epsilon = 10^{-220}$ are used. Root groups $Q_k(x)$ are separated by multiplicity, then square-freeness and degree reconstruction are checked.

2. **Dynamic Tracking Polynomial Long Division**:

* Implements a powerhouse division algorithm that constantly monitors the highest degree and dynamically calculates degree differences (`shift`) to write coefficients into the correct index positions of the quotient coefficient array `Q`, even during calculation processes with sparse polynomials or volatile degree fluctuations. Index misalignment is permanently banished.

3. **Intelligent Safety Guard**:

* If division remainders, factor square-freeness, or degree reconstruction fail validation, diagnostics are logged and the original polynomial is passed to the existing DKA engine. Mixed-multiplicity factors that validate are solved separately.

4. **Auto-scaled DKA**:

* Non-integer preprocessing and each square-free factor are made monic and scaled with the Fujiwara bound $S=2\max_i |a_i|^{1/i}$ using $x=S y$. Factors are converted back after decomposition; DKA rescales each factor and converts roots and final correction magnitudes back to the original variable. A correction magnitude is not a bound on the true error, and scaling does not guarantee convergence for every polynomial.

5. **Pro Debug Analyzer (Internal Visualization Mode)**:

* Real-time dumping of all preprocessing steps (input $P(x)$, derivative $P'(x)$, GCD $G(x)$, reduced expression $Q(x)$, maximum remainder, multiplicity determination) onto a dedicated black-background panel on screen, powerfully supporting development and verification.

6. **Real-Time Progress & Timer UI**:

* Real-time rendering of iterative loop progress percentage (%), elapsed time (`hh:mm:ss`), estimated remaining time, and complete convergence count.

7. **Flexible Batch Paste & Multilingual Support**:

* Supports batch pasting of descending ($a_n \dots a_0$) coefficient comma/space-delimited values, alongside instant language toggling between Japanese and English.

8. **Client-side Calculation & Privacy**:

* Polynomial calculations run in the browser. Coefficients and results are not sent externally unless the optional Gemini explanation is requested.

9. **Optional Gemini Pro AI Explanations**:

* Get explanations in Japanese or English. Coefficients and roots are sent to the Google Gemini API only when requested; the API key field is cleared on submission and the key is not saved.

---

## ⏱ Operational Performance & Recommended Environment (Measured Example)

**Precision interpretation:** The 200 digits describe the output format, not guaranteed correct significant digits. A normalized residual is a numerical backward-error indicator; for example, a residual of $10^{-307}$ does not mean that 307 digits of the root are correct and does not certify any number of correct digits.

**【Test Environment (Windows 11 Home / 8th Gen Intel Core i7 / 16GB RAM)】**

* **Multiple Root Test Case $(x^2+1)^2 = 0$ ($x^4 + 2x^2 + 1 = 0$)**:
* **Preprocessing**: Instantly detects GCD = $x^2+1$ and multiplicity 2 via 320-digit precision.
* **Total Calculation Time**: **< 0.01 seconds (Instantaneous)**
* **Result**: All 4 roots ($+i, +i, -i, -i$) are obtained. The displayed correction is the final DKA iteration correction, not a bound on the true error.
* **20th-Degree Wilkinson Polynomial $W_{20}(x) = \prod_{i=1}^{20} (x - i)$**:
* **v3.4.0 measured example (one run)**: On the test environment above, elapsed time was **00:00:07**, with **110** total factor iterations; **20/20** roots converged and **20/20** passed the normalized residual check ($\le 10^{-180}$). The coefficient reconstruction error was **$2.8046 \times 10^{-247}$**, and the largest estimated final correction was **$2.5735 \times 10^{-246}$** (root 16).
* **50th-Degree Wilkinson Polynomial $W_{50}(x) = \prod_{i=1}^{50} (x - i)$**:
* **v3.4.0 measured example (one run)**: On the same test environment, elapsed time was **00:01:56**, with **308** total factor iterations; **50/50** roots converged and **50/50** passed the normalized residual check ($\le 10^{-180}$). The coefficient reconstruction error was **$2.2324 \times 10^{-220}$**.
* **100th-Degree Wilkinson Polynomial $W_{100}(x) = \prod_{i=1}^{100} (x - i)$**:
* **v3.4.0 measured example (one run with a 1,000-iteration cap)**: Elapsed time was **00:29:52**, with **1,000** total factor iterations. Only **22/100 (22%)** roots met the iteration-convergence criterion; full iteration convergence was not reached. Separately, **100/100** roots passed the normalized residual check, and the coefficient reconstruction error was **$2.1544 \times 10^{-186}$** (threshold $\le 10^{-180}$).
* **Additional measured run on the same hardware (one run with a 5,000-iteration cap)**: Elapsed time was **01:55:12**, with **5,000** total factor iterations. **23/100 (23%)** roots met the iteration-convergence criterion, so the criterion was not reached for all roots. Separately, **100/100** roots passed the normalized residual check and the polynomial coefficient reconstruction error, **$1.1202 \times 10^{-187}$**, passed its threshold ($\le 10^{-180}$). This indicates numerical consistency between the reported root set and the input polynomial in this run; it does not establish convergence of every root or certify true root accuracy.
* Time, iteration count, and correction vary by environment and run. Final corrections, residuals, and coefficient reconstruction errors are numerical indicators; they do not bound the true error or guarantee the correctness of the displayed digits.

---

## 🎧 Application Example: Digital Channel Divider for Hi-Res Audio

The numerical engine has been used as an example in FIR filter design for a multi-amplifier setup using the 3-way speaker **SONY SS-CS5**. The displayed digits and residual checks do not certify filter accuracy; designs for real equipment require independent validation and safe testing.

---

## 🧪 Testing Procedure

1. Access the [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/).
2. Paste multiple root test coefficients (e.g., `1, 0, 2, 0, 1`) or Wilkinson coefficients into the "Coefficient Batch Paste" field and click "Apply All".
3. Press the "🚀 Start High-Precision Numerical Calculation!" button to check the Pro Analyzer logs and calculation results.
4. To try Gemini explanations, enter your Gemini API key in the results panel and request an explanation. The coefficients and results are sent to Google for that request.

---

---

# 📄 Software Requirements Specification (SRS)

**Project Name**: MethodDka (v3.4.0)
**Document Type**: System Requirements Definition & Design Specification

## 1. Overview and Development Objectives

This specification defines *MethodDka* v3.4.0, a browser-based polynomial numerical solver supporting up to degree 200 and using 260-digit internal arithmetic. Roots are normally rounded to 15 digits; components below $0.5 \times 10^{-200}$ in magnitude are shown as 0. Computed values of up to 200 digits are available in a details section, but neither display guarantees correct significant digits. Version 3.4.0 adds Yun's square-free decomposition, using exact BigInt arithmetic for integer coefficients and 320-digit preprocessing ($\epsilon=10^{-220}$) otherwise, separating mixed multiplicities into verified square-free factors before reusing the existing DKA solver.

## 2. System Architecture & Precision Hierarchy Design

This system adopts a two-stage pipeline structure with a distinct precision hierarchy established between the preprocessing and post-processing stages.

1. **Preprocessing Phase (Pre-processing Pipeline)**

* **Arithmetic Precision**: Exact BigInt arithmetic for integer coefficients; otherwise `Decimal.set({ precision: 320 })`
* **Threshold Specification**: Exact divisibility for integer coefficients; otherwise $\epsilon = 10^{-220}$
* **Key Functions**:
* For integer coefficients: Yun decomposition using exact BigInt pseudo-remainder GCD and polynomial division
* For non-integer coefficients: derivative polynomial generation (`derivativePoly`), Euclidean GCD (`polyGCD`), and dynamic polynomial division (`polyDivide`)
* Extraction of square-free factor $Q_k(x)$ for each multiplicity $k$
* Validation of exact divisibility or decimal division remainders, square-freeness, and weighted reconstructed degree

2. **Post-process Solver Phase (DKA Engine Pipeline)**

* **Arithmetic Precision**: `Decimal.set({ precision: 260 })` (output formatted to at most 200 significant digits with 60 guard digits; correct digits are not guaranteed)
* **Threshold Specification**: Scaled-variable correction $\epsilon = 10^{-220}$
* **Key Functions**: Sends each verified square-free factor $Q_k(x)$ to the existing Durand-Kerner-Aberth solver sequentially and expands results by multiplicity $k$. On validation failure, logs diagnostics and sends the original polynomial.

## 3. Preprocessing Module Detailed Design

### 3.1 Dynamic Tracking Polynomial Long Division (`polyDivide`)

* In descending arrays `[a_n, ..., a_0]`, based on the degree difference `degA - degB`, coefficients are written precisely to the correct index positions of the quotient coefficient array `Q` at each division step.
* Dynamic trimming via `trimLeadingZeros` is constantly executed to prevent array breakdown even in cases where coefficients converge to 0 midway.

### 3.2 Robust Euclidean Algorithm (`polyGCD`)

* For non-integer coefficients, loops execute until the degree of the divisor $B_{curr}$ becomes 0 or the maximum absolute value of the remainder falls below or equals $\epsilon = 10^{-220}$.
* Integer coefficients use an exact BigInt pseudo-remainder sequence and exact polynomial division, avoiding tolerance-based GCD decisions.
* The resulting GCD and Yun factors are checked for square-freeness and weighted degree reconstruction.

### 3.3 Yun Decomposition Validation and Fallback

* For non-integer coefficients, validate that each division remainder is at most $\epsilon$; integer-coefficient divisions are checked for exact divisibility. All factors are checked for square-freeness and the residual GCD must be constant.
* Validate the weighted degree identity $\sum_k k \cdot \deg(Q_k) = \deg(P)$.
* On validation failure, log diagnostics and hand the original polynomial to DKA; mixed multiplicities are no longer rejected by a degree-ratio check.

## 4. User Interface (UI) Requirements

* **Pro Debug Analyzer**: Toggle display of internal processing steps (input, derivative, GCD, reduced expression, remainder, multiplicity determination) on screen as structured text.
* **Real-Time Progress Panel**: Dynamic rendering of iterative loop count, elapsed time, and progress bar percentage.
* **Multilingual Support**: Instant switching capability between Japanese and English.

---

## 🌐 Official Page & Repository

* **Web App (Live Demo):** [MethodDka Live Demo](https://yoshiakikoizumija142397.github.io/MethodDka/)
* **GitHub Repository:** [MethodDka Repository](https://github.com/YoshiakiKoizumija142397/MethodDka)

---

## 📜 License & Developer Information

* **Developer**: Yoshiaki Koizumi
* **Version**: v3.4.0
* **License**: MIT License

---
