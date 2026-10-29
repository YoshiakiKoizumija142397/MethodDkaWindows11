# MethodDka (最大200次対応・260桁内部演算／最大180桁形式出力の多項式数値解法 Web アプリ - 180桁バージョン)

[日本語](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11) | [English](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11/blob/main/README_EN.md)

## 🇯🇵 日本語概要

*MethodDka* は、HTML と JavaScript だけで動作する多項式数値解法・因数分解 Web アプリケーション（および MSI インストーラー版）の **180桁バージョン** です。DKA法（Durand-Kerner-Aberth 法）を採用し、Decimal.js による **260桁内部演算** を行います。実部は有効数字180桁、虚部は $10^{-180}$ の単位で四捨五入して表示します。この表示桁数は正しい有効桁数を保証しません。20次ウィルキンソン多項式の既知根 1〜20 とのベンチマーク照合では、検証実行において高精度な一致を確認しています。

本バージョンでは、収束判定値および前処理の許容誤差を **$10^{-180}$** に設定した **180桁バージョン** として最適化されています。また、本プロジェクトは Antigravity と Google の AI である Gemini を活用したAI仕様駆動開発（AI Spec-Driven Development）によって設計・実装されており、すべての数値計算ロジックや検証プロセスは作者自身によって厳密にレビューおよび検証されています。**なお、GitHub Pages で公開しているオンライン版、およびリポジトリから ZIP 形式でダウンロードしてブラウザ等で直接ご利用いただくオフライン版については、今回の Node.js 関連のアップデートやセキュリティパッチは一切影響いたしません（関係ありません）。**

前処理ではユンの平方無因子分解を導入し、整数係数は BigInt による厳密演算で、それ以外の係数は180桁精度（収束判定・許容誤差 $\epsilon = 10^{-180}$）で処理し、異なる重複度を持つ根を重複度ごとの平方無因子多項式 $Q_k(x)$ に分離します。検証済みの各因子を既存の DKA エンジンへ個別に渡し、重複度で重み付けした次数の再構成を検査します。検証に失敗した場合は診断ログを表示して元の多項式へフォールバックします。

---

## 📋 システム仕様 (Technical Specifications - 180桁バージョン)

| 項目 | 詳細仕様 (180桁バージョン 拡張) |
| --- | --- |
| **コア解法** | DKA法 (Durand-Kerner-Aberth Simultaneous Root-Finding Method) |
| **演算精度階層** | **階層型マルチプレシジョン設計 (180桁バージョン)**<br>

<br>

<br>・前処理フェーズ: 整数係数は **BigInt厳密演算**、その他は **180桁固定精度**（収束判定・許容誤差 $\epsilon = 10^{-180}$）<br>

<br>

<br>・後工程ソルバー: **260桁内部演算 / 最大180桁形式で出力**（ガード桁を確保し、補正量閾値・収束判定値を $\epsilon = 10^{-180}$ に設定。出力桁数は正しい有効桁数を保証しません） |
| **精度の解釈** | 実部は有効数字180桁、虚部は $10^{-180}$ の単位で四捨五入して出力します。これは表示形式であり、正しい有効桁数の保証ではありません。正規化残差は後退誤差の数値指標です。 |
| **AI仕様駆動開発** | **AI Spec-Driven Development (Antigravity & Gemini)**<br>

<br>

<br>・仕様策定からコード生成、自動デバッグ、ベンチマークテスト、MSIパッケージングに至るまでAI支援を全面的に活用し、作者自身がすべてのプロセスを厳密にレビュー・検証。 |
| **自動前処理 (GCD)** | **ユンの平方無因子分解 (Yun's Square-free Decomposition)**<br>

<br>

<br>・微分多項式 $P'(x)$ とのユークリッド互除法による $\gcd(P, P')$ の算出<br>

<br>

<br>・整数係数では BigInt 擬似剰余列を使った厳密 GCD、それ以外では180桁精度（$\epsilon = 10^{-180}$）と動的多項式除算 (`polyDivide`) を用いて重複度別の平方無因子群 $Q_k(x)$ を抽出 |
| **セーフティガード機構** | 各多項式除算の余り、因子の平方無因子性、重複度を反映した再構成次数を検証。失敗時は診断ログを出して元多項式を DKA へ渡す。 |
| **数値安定化** | 非整数係数の前処理と各 DKA 因子をそれぞれモニック化し、Fujiwara 根上界に基づく変数スケール $x = Sy$ を適用 |
| **初期値配置** | スケール済み変数 $y$ の円周上に Aberth 初期値を配置 |
| **対応最高次数** | 最高 200 次 ($n \le 200$) |
| **多項式評価** | ホーナー法 (Horner's Method) による高精度多項式直評価 |
| **セーフティロック** | 反復上限の既定値は因子ごとに **5,000回**（入力欄で10〜50,000回に設定可能。収束判定値は $10^{-180}$）。上限到達時はその時点の解と最終補正量を出力 |
| **結果処理** | 実部昇順ソート、複素数表記 ($a + bi$)、重複度表示、DKA最終補正量、各根の正規化残差、全根からの係数再構成残差を表示。 |
| **動作環境** | 計算はクライアントサイド（HTML5 / JavaScript ES6+）。MSI インストーラー版では Windows 環境へネイティブに近い形でパッケージングされ、Node.js セキュリティパッチを適用済み。<br>

<br>※ **GitHub Pages のオンライン版および ZIP ダウンロードによるオフライン版は、ブラウザ単体で動作するため今回の Node.js セキュリティ要件等の影響は受けません。** |

---

## 🚀 主な機能と特徴 (180桁バージョン)

1. **AI仕様駆動開発 (AI Spec-Driven Development)**:
* Antigravity と Gemini を駆使した高度な開発プロセスにより、設計・実装・検証を堅牢に遂行。すべての生成コードは作者による厳密な検証を経由。


2. **180桁高精度演算・収束判定 ($10^{-180}$)**:
* 内部260桁演算をベースとしつつ、収束判定値および許容誤差を $10^{-180}$ に設定した 180桁バージョンとして精緻な演算を実行。


3. **Node.js セキュリティパッチ対応 (MSI版向け)**:
* MSIインストーラー版およびソース環境向けに依存関係およびパッケージ構成（`package.json` / `package-lock.json`）をアップデート。
* ※ **GitHub Pages 版および ZIP 版（オフライン利用）には今回のセキュリティパッチ適用は関係ありません（影響なし）。**


4. **ユンの平方無因子分解**:
* 整数係数は BigInt による厳密な GCD・多項式除算で、それ以外は180桁精度（$\epsilon = 10^{-180}$）で処理し、同じ重複度を持つ根の因子群 $Q_k(x)$ を分離します。


5. **動的トラッキング型多項式長除法**:
* 歯抜けの多項式や次数が激しく変動する演算過程においても、常に最高次数を監視し次数差 (`shift`) を動的に計算して商の正しい位置に係数を書き込む強力な除算アルゴリズムを実装。


6. **検証付きフォールバック**:
* 割り算の余り、平方無因子性、再構成次数のいずれかが検証を通らない場合は診断ログを出し、元多項式を既存 DKA へ渡します。


7. **オートスケーリング付き DKA**:
* 非整数係数の前処理と各平方無因子因子の DKA で、Fujiwara 上界 $S = 2 \max_i \vert{}a_i\vert{}^{1/i}$ を使って $x = Sy$ に変数変換します。


8. **Pro デバッグアナライザ (内部可視化モード)**:
* 前処理の全ステップ（入力 $P(x)$、微分 $P'(x)$、GCD $G(x)$、縮約式 $Q(x)$、余り最大値、重複度判定）を専用黒背景パネルにリアルタイムダンプ。


9. **リアルタイム進捗 ＆ タイマー UI / 柔軟な一括ペースト**:
* 反復ループ進捗率（%）、経過時間、推定残り時間、完全収束数をリアルタイムに描画。カンマ・空白区切り一括ペーストに対応。



---

## 🌐 公式ページ & リポジトリ

* **Web アプリ (Live Demo):** [MethodDka Live Demo](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)
* **GitHub リポジトリ:** [MethodDka Repository](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)

## 📄 ライセンス & 開発者情報

* **開発者:** 小泉嘉章 (Yoshiaki Koizumi)
* **バージョン:** 180桁バージョン (v3.6.0ベース)
* **ライセンス:** [MIT License](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)

---

## 🇬🇧 英語版 README (`README_EN.md`)

```markdown
# MethodDka (Polynomial Numerical Solver & Factoring Web App with up to 200th Degree & 260-Digit Internal / 180-Digit Max Output Precision - 180-Digit Version)

[日本語](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11) | [English](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11/blob/main/README_EN.md)

## 🇬🇧 English Overview
*MethodDka* is a polynomial numerical solver and factoring web app (along with an MSI installer version) built purely with HTML and JavaScript as the **180-Digit Version**. It adopts the DKA method (Durand-Kerner-Aberth Simultaneous Root-Finding Method) utilizing **260-digit internal precision** via Decimal.js. Real parts are rounded to 180 significant digits, and imaginary parts are rounded to $10^{-180}$. These display digits do not guarantee correct effective accuracy.

In this version, the convergence tolerance and preprocessing precision threshold are strictly set to **$10^{-180}$** for the **180-digit version**. Furthermore, this project is designed and implemented through **AI Spec-Driven Development** leveraging Antigravity and Google's Gemini, with all core logic and verification processes rigorously reviewed and validated by the author. **Please note that the online version hosted on GitHub Pages and the offline version obtained via ZIP download from the repository are entirely unaffected by (and have no relation to) these Node.js-related updates or security patches.**

Preprocessing introduces Yun's square-free decomposition: integer coefficients are handled with exact BigInt arithmetic, while others use 180-digit precision ($\epsilon = 10^{-180}$) to separate roots with distinct multiplicities into square-free polynomials $Q_k(x)$ for each multiplicity. Each verified factor is passed individually to the DKA engine, and the reconstructed degree weighted by multiplicity is checked. If validation fails, diagnostic logs are displayed and the app falls back to the original polynomial.

---

## 📋 Technical Specifications (180-Digit Version)

| Item | Detailed Specification (180-Digit Version Extended) |
| :--- | :--- |
| **Core Solver** | DKA Method (Durand-Kerner-Aberth Simultaneous Root-Finding Method) |
| **Precision Tier Architecture** | **Hierarchical Multiprecision Design (180-Digit Version)**<br><br>・Preprocessing Phase: **Exact BigInt arithmetic** for integer coefficients, **180-digit fixed precision** (convergence tolerance & threshold $\epsilon = 10^{-180}$) for others<br><br>・Post-Processing Solver: **260-digit internal precision / up to 180-digit formatted output** (guard digits included, correction threshold & convergence tolerance set to $\epsilon = 10^{-180}$. Output digits do not guarantee correct effective accuracy) |
| **Interpretation of Precision** | Real parts are output rounded to 180 significant digits, and imaginary parts to $10^{-180}$. This is a display format and does not guarantee correct effective accuracy. Normalized residuals serve as a numerical indicator of backward error. |
| **AI Spec-Driven Development** | **AI Spec-Driven Development (Antigravity & Gemini)**<br><br>・AI assistance fully integrated across planning, code generation, debugging, benchmarking, and packaging, with rigorous author review and validation on every step. |
| **Automatic Preprocessing (GCD)** | **Yun's Square-free Decomposition**<br><br>・Computation of $\gcd(P, P')$ via Euclidean algorithm with derivative polynomial $P'(x)$<br><br>・Exact GCD using BigInt pseudo-remainder sequences for integer coefficients, and 180-digit precision ($\epsilon = 10^{-180}$) with dynamic polynomial division (`polyDivide`) for others to extract square-free factors $Q_k(x)$ by multiplicity |
| **Safety Guard Mechanism** | Validates the remainder of each polynomial division, the square-free property of factors, and the reconstructed degree reflecting multiplicity. If validation fails, logs diagnostics and passes the original polynomial to DKA. |
| **Numerical Stabilization** | Monic normalization of non-integer coefficient preprocessing and each DKA factor, followed by variable scaling $x = Sy$ based on Fujiwara's root bound |
| **Initial Value Placement** | Aberth initial values placed on a circle for scaled variable $y$ |
| **Supported Max Degree** | Up to 200th degree ($n \le 200$) |
| **Polynomial Evaluation** | High-precision direct polynomial evaluation via Horner's Method |
| **Safety Lock** | Default iteration limit is **5,000** per factor (configurable from 10 to 50,000 via input field; convergence tolerance set to $10^{-180}$). Upon reaching the limit, current roots and final corrections are output |
| **Result Processing** | Displays real parts sorted in ascending order, complex number notation ($a + bi$), multiplicity, final DKA corrections, normalized residuals for each root, and coefficient reconstruction residuals from all roots. |
| **Runtime Environment** | Client-side computation (HTML5 / JavaScript ES6+). The MSI installer version packages it natively for Windows environments with Node.js security patches applied.<br>※ **The GitHub Pages online version and ZIP download edition run purely within the browser and are unaffected by Node.js security requirements.** |

---

## 🚀 Key Features (180-Digit Version)

1. **AI Spec-Driven Development (Antigravity & Gemini)**:
   - Designed and engineered through an advanced AI-assisted workflow ensuring robust structure and precise implementation, thoroughly vetted by the author.
2. **180-Digit Precision & Convergence Tolerance ($10^{-180}$)**:
   - Tailored as the **180-digit version**, utilizing internal 260-digit calculations while enforcing a strict convergence threshold and error tolerance of $10^{-180}$.
3. **Node.js Security Patch Support (MSI Edition)**:
   - Updated dependencies and package configuration (`package.json` / `package-lock.json`) for the MSI installer and source development environment.
   - ※ **GitHub Pages version and ZIP download edition (offline use) are completely unaffected and unrelated to this security patch.**
4. **Yun's Square-free Decomposition**:
   - Handles integer coefficients with exact BigInt GCD/division and others with 180-digit precision ($\epsilon = 10^{-180}$), isolating factor groups $Q_k(x)$ with identical root multiplicities.
5. **Dynamic Tracking Polynomial Long Division**:
   - Robust division algorithm that continuously monitors leading degrees and dynamically computes degree shifts (`shift`) to write coefficients into correct quotient positions even under sparse polynomials or volatile degree fluctuations.
6. **Verified Fallback**:
   - If division remainders, square-free properties, or reconstructed degrees fail validation, diagnostic logs are output and the original polynomial is passed to the legacy DKA engine.
7. **DKA with Auto-Scaling**:
   - Applies variable scaling $x = Sy$ using Fujiwara's upper bound $S = 2 \max_i \vert{}a_i\vert{}^{1/i}$ for non-integer preprocessing and each square-free factor's DKA execution.
8. **Pro Debug Analyzer (Internal Visualization Mode)**:
   - Real-time dump of all preprocessing steps (input $P(x)$, derivative $P'(x)$, GCD $G(x)$, reduced form $Q(x)$, max remainder, multiplicity checks) onto a dedicated dark-themed console panel.
9. **Real-Time Progress & Timer UI / Flexible Bulk Paste**:
   - Renders iteration loop progress percentage, elapsed time, estimated time remaining, and fully converged count in real-time. Supports comma- and space-delimited bulk pasting.

---

## 🌐 Official Page & Repository

- **Web App (Live Demo):** [MethodDka Live Demo](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)
- **GitHub Repository:** [MethodDka Repository](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)

## 📄 License & Developer Information

- **Developer:** Yoshiaki Koizumi (小泉嘉章)
- **Version:** 180-Digit Version
- **License:** [MIT License](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)

```