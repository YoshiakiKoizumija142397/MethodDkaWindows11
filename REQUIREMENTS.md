# ソフトウェア開発要求仕様書 (SOFTWARE REQUIREMENTS SPECIFICATION)

**プロジェクト名:** MethodDka (最大200次対応・260桁内部演算・最大200桁形式出力の多項式数値解法 Web / Windows アプリケーション)
**バージョン:** v3.4.0
**最終改訂日:** 2026年10月8日
**開発者 / 権利者:** Yoshiaki Koizumi (小泉嘉章)  
**ライセンス:** MIT License  

**v3.4.0 更新:** ユン平方無因子分解を追加。整数係数はBigIntで厳密に、それ以外は320桁・$\epsilon=10^{-220}$ で分解し、混在重複度を重複度別因子へ分離して既存DKAエンジンで解く。

---

## 1. プロジェクト概要 (Overview)

本プロジェクトは、Durand-Kerner-Aberth (DKA) 法と `Decimal.js` を組み合わせ、260桁内部精度（60ガード桁）で計算した全複素解を200有効桁で出力し、因数分解を行う Web / ネイティブアプリケーション開発を目的とする。表示桁数と反復補正量による収束判定は、正解桁数の保証を意味しない。v3.4.0ではユンの平方無因子分解による重複度別因子分離を導入し、Web版の数値計算はブラウザー内で実行する。任意のGemini Pro解説機能を明示的に実行した場合に限り、係数と計算結果をGoogle Gemini APIへ送信する。

---

## 2. 開発者・著作権 ＆ ライセンス情報 (Developer & Licensing)

### 2.1 開発者 ＆ 著作権所有者 (Developer & Copyright)
- **開発者氏名:** Yoshiaki Koizumi (小泉嘉章)
- **著作権表示:** Copyright (c) 2026 Yoshiaki Koizumi
- **公式リポジトリ:** 
  - Web版: [https://github.com/YoshiakiKoizumija142397/MethodDka](https://github.com/YoshiakiKoizumija142397/MethodDka)
  - Windows11ネイティブ版: [https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)

### 2.2 ライセンス条項 (Software License)
本ソフトウェアは **MIT License** のもとで公開・配布される。

> **MIT License**  
>  
> Copyright (c) 2026 Yoshiaki Koizumi  
>  
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:  
>  
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.  
>  
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

---

## 3. システム要件 (System Requirements)

### 3.1 動作環境
- **Webアプリケーション:** 全主要モダンブラウザ (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari)
- **デスクトップアプリケーション:** Windows 11 (64-bit) ネイティブアプリ (MSI / APPX パッケージ)

### 3.2 セキュリティ ＆ プライバシー
- **クライアントサイド計算:** 多項式評価および DKA 反復計算はユーザーのブラウザ・端末ローカル環境内で実行する。
- **任意のGemini Pro解説:** 利用者が明示的に解説を依頼した場合に限り、入力係数と算出解をGoogle Gemini APIへ送信する。APIキーは利用者が入力し、送信時に入力欄を消去し、アプリケーションは保存しない。Google側のデータ処理はGoogleの規約・設定に従う。

---

## 4. 機能要求仕様 (Functional Requirements)

### 4.1 精度・アルゴリズム要件
1. **200桁表示とガード桁:** DKA本体は `Decimal.set({ precision: 260 })` で計算し、60桁をガード桁として確保する。実部は有効数字200桁、虚部は $10^{-200}$ の単位で四捨五入し、小数点以下200桁で表示する。これは表示形式と内部演算精度の仕様であり、表示桁数が正しいことを保証しない。有限精度演算の丸め誤差や悪条件性は残る。
2. **正統派 DKA ＋ オートスケーリング演算:** 
   - 各平方無因子因子をモニック化し、Fujiwara根上界 $S_x = 2\max_{1 \le i \le n,\; a_i \ne 0}|a_i|^{1/i}$ をスケール因子とする。全ての非最高次係数が0の場合は $S_x=1$ とする。
   - 変数変換 $x=S_x y$ により、スケール済みモニック多項式 $P_s(y)=P(S_x y)/(a_n S_x^n)$ を構成する。
   - 非整数係数の平方無因子分解前処理も同じ根スケールで行い、抽出した因子係数を元の $x$ 変数へ変換してからDKA段階へ渡す。
   - スケーリング空間上でAberth初期値を配置し、DKA反復 $\Delta y_i=P_s(y_i)/\prod_{j \ne i}(y_i-y_j)$ を実行する。
   - スケール空間での補正量 $\lvert\Delta y_i\rvert \le 10^{-220}$ を実装上の収束条件とし、根と最終補正量を $x_i=S_x y_i$ の元スケールへ復元する。表示する最終補正量は収束の参考値であり、数学的な誤差保証ではない。
   - 出力した各根を入力多項式に代入し、正規化残差 $\eta(z)=|P(z)|/\sum_i |a_i||z|^{n-i}$ を計算する。また根の多重度を含む全根からモニック多項式の係数を再構成し、入力係数との正規化最大差を計算する。反復収束率、$\eta(z)\le10^{-180}$ を満たす根の数、係数再構成残差を別々に表示する。これらは後退誤差・集合整合性の数値指標であり、根の前進誤差、有効桁数、正しさの証明ではない。残差が $10^{-307}$ であっても307桁正しいことを意味しない。正しい有効桁数を保証する機能は本仕様の対象外とする。
   - スケーリングは数値範囲を整えるものであり、全ての多項式の収束を保証しない。
3. **収束条件 ＆ セーフティロック:** 
   - スケーリング後の個別解の補正量 $\lvert\Delta y_i\rvert \le 10^{-220}$ を満たした時点で該当解を反復収束と判定する。残差チェックとは別に表示し、どちらも正しさの証明とはしない。
   - 因子ごとの反復上限は既定値を 5,000 回とし、入力欄から 10〜50,000 回の範囲で設定できるようにする。上限に達した場合は到達時点の解と最終補正量を出力する。
4. **ユンの平方無因子分解:** 整数係数多項式はBigIntの厳密な擬剰余列・除算、それ以外は320桁精度、$\epsilon=10^{-220}$ のGCDと多項式除算を用いて、重複度 $k$ ごとの平方無因子因子 $Q_k(x)$ に分解する。整数係数は割り切れ性、全入力は因子の平方無因子性および $\sum_k k\deg(Q_k)=\deg(P)$ を検証し、各因子を既存DKAエンジンで個別に解いてから重複度に応じて結果を統合する。検証に失敗した場合は診断ログを表示し、元多項式をDKAに渡す。

### 4.2 係数入力 ＆ 解析機能
1. **最高次数指定:** 最大 200 次までの任意次数 $n$ を指定可能。
2. **一括ペースト機能 (`applyBulk`):** 
   - カンマまたは空白区切りの係数文字列（降順 $a_n, a_{n-1}, \dots, a_0$）を解析し、各入力欄 `coeff-k`（$x^k$ の係数）へ正しく割り振る。
3. **Gemini Proによる任意解説:** 計算後、利用者がAPIキーを入力して明示的に実行した場合に限り、係数、根、最終補正量、反復回数をGemini APIへ送り、日本語または英語で解説を表示する。APIキーを永続化せず、AI出力は数値計算結果の代替にしない。

### 4.3 進捗表示 ＆ リアルタイムUI
1. **リアルタイム計測:** 経過時間（`00:00:00` 形式）、推定残り時間、ループ数、最悪補正量を追跡。
2. **進捗率 ＆ 反復回数定義:** 
   - 演算完了時、進捗率 UI パネルは **100.0%** へ完全同期描画する。
   - **解ごとの個別反復回数:** 各解 $z_i$ が収束条件に達した時点の反復ループ数を記録。
   - **総反復回数 (Total Iterations):** 各解の個別反復回数の全合計（$\sum \text{perRootIter}_i$）を集計・出力する。

### 4.4 モード切替トグルボタン仕様 (Mode Switching Specifications)
計算完了後、算出された解データを内部演算精度で保持し、実部は有効数字200桁、虚部は $10^{-200}$ の単位で四捨五入して小数点以下200桁で表示すること。表示桁数は正しい有効桁数を保証しない。**トグルスイッチの切替のみで非破壊かつリアルタイムに数値解表示と因数分解表示を変更**できること。

1. **数値解表示モード (Numerical Solver Mode) [デフォルト]:**
   - **概要:** 実部は指数形式で有効数字200桁、虚部は小数点以下200桁の固定小数形式で表示する。虚部は $10^{-200}$ の単位で四捨五入し、絶対値が $0.5\times10^{-200}$ 未満なら表示上ゼロとする。これは表示形式であり、正しい桁数の保証ではない。
   - **出力内容:** 解番号、数値検査の状態、実部200有効数字・虚部小数点以下200桁の表示、最終補正量、正規化残差、個別反復回数。
2. **因数分解専用モード (Factorization Only Mode):**
   - **概要:** 算出された複素解をもとに、多項式の因数分解形式 $P(x) = a_n \prod_{i=1}^n (x - z_i)$ を生成・出力する。
   - **非破壊・四捨五入処理:** 保持されている内部演算精度の解データ自体は維持し、因数分解表示時のみ各解の実部・虚部を**小数点第1位で四捨五入（整数化）**して $(x - z_i)$ の因数式を組み立てる。
   - **トグル復帰:** トグルボタンを元に戻すと、保持されていた内部演算精度の解データから所定の表示形式へ一瞬で復帰する。

---

## 5. 多言語対応仕様 (Multilingual Requirements)

1. **バイリンガル UI (日本語 / English):**
   - 画面右上の切替ボタンにより、タイトル、説明文、ボタンテキスト、進捗パネル、解カード内のラベル、トグルスイッチの説明文（モードタイトル・説明）を即座に動的更新する。

---

## 6. リポジトリ構成 ＆ 移植管理 (Repository Synchronization)

1. **メインリポジトリ (`MethodDka`):**
   - `index.html`: Webランディングページ
   - `MethodDka.html`: メイン計算アプリ（本仕様書の全ロジックを搭載）
   - `help.html`: ヘルプ・テストデータ（20次ウィルキンソン多項式データ等）
   - `privacy.html`: プライバシーポリシー
   - `REQUIREMENTS.md`: ソフトウェア開発要求仕様書
2. **完全同期規約:** `MethodDka` で修正・動作確認された全ファイルは、ネイティブビルド用リポジトリ `MethodDkaWindows11` へ完全同一内容でマスターコピー上書きされること。

---

## 7. 改訂履歴 (Revision History)

| バージョン | 改訂日 | 改訂内容・主要更新事項 | 承認・改訂者 |
| :--- | :--- | :--- | :--- |
| **v1.0.0** | 2026年5月10日 | 初版作成 (50桁標準精度版 DKA エンジン実装) | Yoshiaki Koizumi |
| **v2.0.0** | 2026年6月15日 | オートスケーリング機構 (Sx) の導入・オーバーフロー対策 | Yoshiaki Koizumi |
| **v3.0.0** | 2026年7月20日 | 200桁ダイレクト精度演算への拡張および全画面UI刷新 | Yoshiaki Koizumi |
| **v3.1.0** | 2026年8月10日 | リアルタイム進行状況・経過時間・推定残り時間パネルの追加 | Yoshiaki Koizumi |
| **v3.4.0** | 2026年10月8日 | **[最新版]** 整数係数BigInt厳密演算・非整数係数320桁のユン平方無因子分解、異なる重複度の根を因子別に解く処理、Gemini Pro任意解説 | Yoshiaki Koizumi |
| **v3.2.0** | 2026年8月23日 | 高精度解法/因数分解モード切替トグルスイッチ追加、解ごとの個別反復回数集計（総反復回数定義更新）、バイリンガル（日/英）多言語対応、開発者・MITライセンス明記 | Yoshiaki Koizumi |

---

### 承認 ＆ 権利署名 (Approval & Sign-off)

- **仕様作成・権利所有者:** Yoshiaki Koizumi (小泉嘉章)
- **最終承認日:** 2026年8月23日
- **著作権:** Copyright &copy; 2026 Yoshiaki Koizumi. All rights reserved. Under MIT License.

```

---

### 2. `README.md` の完全全体コード

以下の枠内を全選択（`Ctrl + A`）してコピーし、`README.md` にそのまま上書き保存してください。

```markdown
# MethodDka (v3.4.0)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.4.0-green.svg)](https://github.com/YoshiakiKoizumija142397/MethodDka)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Windows%2011-lightgrey.svg)](https://github.com/YoshiakiKoizumija142397/MethodDka)

**260桁内部演算・実部200有効数字／虚部は10^-200単位で四捨五入**
*A web and Windows application using 260-digit internal arithmetic. The real part is formatted to 200 significant digits; the imaginary part is rounded to the nearest 10^-200. Output length does not guarantee accuracy; the degree-20 Wilkinson benchmark has been checked against its known roots 1–20. Web calculations run client-side; the optional Gemini Pro explanation sends coefficients and results to Google's API only when requested.*

---

## 📋 目次 / Table of Contents
- [概要 / Overview](#-概要--overview)
- [主な特徴 / Key Features](#-主な特徴--key-features)
- [ライブデモ ＆ リポジトリ / Live Demo & Repositories](#-ライブデモ--リポジトリ--live-demo--repositories)
- [使い方 / Quick Start & Usage](#-使い方--quick-start--usage)
- [技術仕様 ＆ 数学的背景 / Technical Architecture](#-技術仕様--数学的背景--technical-architecture)
- [プロジェクト構成 / Project Structure](#-プロジェクト構成--project-structure)
- [多言語対応 / Multilingual Support](#-多言語対応--multilingual-support)
- [コントリビューション / Contributing](#-コントリビューション--contributing)
- [ライセンス / License](#-ライセンス--license)
- [開発者情報 / Author & Contact](#-開発者情報--author--contact)

---

## 🔍 概要 / Overview

**日本語:**  
MethodDka は高精度演算とDKA法による多項式根計算を行うWeb/ネイティブアプリケーションです。
各因子のFujiwara根上界に基づく変数スケーリングは計算範囲を整えますが、悪条件・根の大きさの極端な差・高次数による収束困難を解消または保証するものではありません。

**English:**  
MethodDka computes polynomial roots using extended-precision arithmetic and the DKA method.
Variable scaling based on a Fujiwara root bound helps normalize each factor, but does not guarantee convergence for ill-conditioned inputs, extreme root spreads, or high degrees.

---

## ✨ 主な特徴 / Key Features

**日本語:**  
- **実部200桁・虚部10^-200単位:** `Decimal.js` の260桁内部精度で計算し、実部は有効数字200桁の指数形式、虚部は小数点以下200桁の固定小数形式で表示する。虚部は $10^{-200}$ の単位で四捨五入する。これは出力形式であり、正しい桁数の保証ではない。有限精度の丸め誤差は残り、出力桁数・収束判定・正規化残差は正解桁数の保証ではない。残差 $10^{-307}$ も307桁正しいことを意味しない。
- **オートスケーリング機構 ($S_x$):** 因子ごとのFujiwara根上界に基づき変数と初期値をスケーリングし、出力根と最終補正量を元の尺度へ復元する。
- **結果の数値チェック:** 出力根ごとの正規化残差（後退誤差指標）と、全根から再構成した多項式の係数残差を計算する。反復収束、根ごとの閾値 $10^{-180}$ 適合数、集合全体の再構成チェックを別々に表示する。これらは有効桁数の認証ではなく、小さな残差も真の根誤差や正しい有効桁数を保証しない。正しい有効桁数の保証は本仕様の対象外。
- **リアルタイム処理状況追跡:** ループ進捗率（%）、経過時間、推定残り時間、最終補正量をリアルタイム描画。
- **非破壊モード切替トグルスイッチ:**
  - **数値解表示モード:** 各解の実部は有効数字200桁の指数形式、虚部は $10^{-200}$ の単位で四捨五入した小数点以下200桁の固定小数形式で表示する。表示桁数は正しい有効桁数を保証しない。元変数尺度の最終補正量（誤差保証ではありません）と個別反復回数も表示する。
  - **因数分解専用モード:** 解を四捨五入（整数化）し、多項式の因数分解形式 $P(x) = a_n \prod (x - z_i)$ を生成。
- **クライアントサイド計算:** 数値計算は端末内で完結する。Gemini Pro解説を明示的に依頼した場合は係数と計算結果をGoogle Gemini APIへ送信する。
- **バイリンガルUI:** 画面右上のボタンで「日本語 ⇔ English」をワンクリック即座切替。

**English:**  
- **200-Digit Root Display:** The DKA solver uses 260-digit Decimal.js arithmetic, displays the real part to 200 significant digits, and rounds the imaginary part to the nearest $10^{-200}$, shown with 200 decimal places. Output length does not guarantee correct digits.
- **Numerical Result Check:** Computes a normalized residual (backward-error indicator) for each displayed root and a coefficient reconstruction residual for the complete root multiset. Reports these separately from iteration convergence. Small residuals do not guarantee forward root accuracy.
- **Auto-Scaling Mechanism ($S_x$):** Scales each factor and initial values using a Fujiwara root bound, then restores roots and final correction magnitudes to the original variable scale.
- **Real-Time Execution Tracking:** Live progress bar, loop counts, elapsed execution time, and estimated time remaining.
- **Dual Display Mode (Non-Destructive Toggle):**
  - **Numerical Solver Mode:** Displays the real part to 200 significant digits and rounds the imaginary part to the nearest $10^{-200}$, shown with 200 decimal places. Output length is not a certified error bound. Also shows final correction estimates in the original variable scale and individual root iteration counts.
  - **Factorization Mode:** Non-destructively rounds roots to nearest integers to generate factored forms $P(x) = a_n \prod (x - z_i)$.
- **Client-Side Calculation:** Numerical calculations run locally. The optional Gemini Pro explanation sends coefficients and results to the Google API only when requested.
- **Bilingual Interface:** Instant real-time language toggle between Japanese (日本語) and English.

---

## 🌐 ライブデモ ＆ リポジトリ / Live Demo & Repositories

- **Webアプリ (Live Web App):** [MethodDka Web App](https://yoshiakikoizumija142397.github.io/MethodDka/MethodDka.html)
- **Webリポジトリ (Web Repository):** [YoshiakiKoizumija142397/MethodDka](https://github.com/YoshiakiKoizumija142397/MethodDka)
- **Windows 11ネイティブ版 (Windows 11 Repository):** [YoshiakiKoizumija142397/MethodDkaWindows11](https://github.com/YoshiakiKoizumija142397/MethodDkaWindows11)
- **係数ジェネレーター (Wilkinson Coefficient Generator):** [Wilkinson Coeff Generator](https://yoshiakikoizumija142397.github.io/wilkinson-coeff-generator/)

---

## 🚀 使い方 / Quick Start & Usage

### 1. 起動方法 / How to Run
**日本語:**  
インストールの必要はありません。リポジトリをクローンまたはダウンロードし、ブラウザで `index.html` または `MethodDka.html` を開くだけで即座に動作します。

**English:**  
No installation required. Simply clone or download the repository and open `index.html` or `MethodDka.html` in any modern web browser.

```bash
git clone [https://github.com/YoshiakiKoizumija142397/MethodDka.git](https://github.com/YoshiakiKoizumija142397/MethodDka.git)
cd MethodDka
# ブラウザで MethodDka.html を開きます / Open MethodDka.html in your web browser

```

### 2. 計算手順 / Step-by-Step Solver Guide

**日本語:**

1. **最高次数 $n$ の指定:** 次数（最大200）を入力し、「入力欄生成」を押します。
2. **係数入力・一括ペースト:** 係数データを降順（$a_n, a_{n-1}, \dots, a_0$）で一括ペーストし、「一括反映」を押します。
3. **計算開始:** 「🚀 高精度数値計算開始！」ボタンを押して反復計算を開始します。表示は最大200桁形式ですが、正しい有効桁数を保証しません。
4. **モード切り替え:** 計算終了後、トグルスイッチで高精度解表示と因数分解表示を自由に切り替えます。

**English:**

1. **Specify Degree ($n$):** Enter the highest degree $n \le 200$ and click **"Generate Fields"**.
2. **Bulk Input:** Paste comma- or space-separated coefficients in descending order ($a_n, a_{n-1}, \dots, a_0$) and click **"Apply"**.
3. **Execute Solver:** Click **"🚀 Start 200-Digit Precision Solver!"**.
4. **Toggle Output Mode:** Switch between **High Precision Solver Mode** and **Factorization Only Mode** instantly at any time.

---

## 🛠️ 技術仕様 ＆ 数学的背景 / Technical Architecture

**日本語:**

Durand-Kerner-Aberth (DKA) 法の同時反復補正式 $\Delta z_i$ を用いて、すべての複素解を同時に収束させます。

**English:**

The Durand-Kerner-Aberth iteration formula calculates root updates $\Delta z_i$ simultaneously across all $n$ complex initial roots:

$$\Delta z_i = \frac{P_s(z_i)}{\prod_{j \neq i} (z_i - z_j)}$$

* **オートスケーリング因子 (Auto-Scaling Factor):** 因子ごとのFujiwara上界 $S_x = 2\max_{1 \le i \le n,\; a_i \ne 0}|a_i/a_n|^{1/i}$。DKA後は根と最終補正量を $x=S_x y$ で元スケールへ復元する。最終補正量は真の誤差を保証しない。
* **DKA内部精度 / 表示精度:** 260桁内部演算（60ガード桁）/ 最大200有効桁形式で出力（正しい桁数の保証ではない）
* **収束判定条件 (Convergence Criterion):** スケール空間の補正量 $\lvert\Delta y_i\rvert \le 10^{-220}$（実装上の停止条件であり誤差保証ではない）
* **セーフティロック (Max Loop Cap):** Default 5,000 iterations per factor; configurable from 10 to 50,000.

---

## 📁 プロジェクト構成 / Project Structure

```text
MethodDka/
├── index.html        # Webランディングページ / Main landing page
├── MethodDka.html # 260桁内部演算・最大200桁形式出力の計算アプリ / Core polynomial solver app
├── help.html         # ヘルプ・テスト benchmark データ / User guide & benchmark data
├── privacy.html      # プライバシーポリシー / Privacy policy
├── REQUIREMENTS.md   # ソフトウェア開発要求仕様書 / Software Requirements Specification
└── README.md         # プロジェクト説明ドキュメント / Project documentation (this file)

```

---

## 🌐 多言語対応 / Multilingual Support

**日本語:**

本アプリケーションは「日本語」と「英語」に完全対応しています。画面右上の切り替えボタンを押すことで、計算状態を保持したまますべての表記（タイトル、説明文、進行状況、結果表示、トグル説明）が即座に動的更新されます。

**English:**

The application seamlessly supports both **Japanese** and **English**. Clicking the **"English / 日本語"** button at the top right corner of any page dynamically updates all UI text without reloading or losing calculated state.

---

## 🤝 コントリビューション / Contributing

**日本語:**

バグ報告や機能提案、プルリクエストを心より歓迎いたします。

**English:**

Contributions, bug reports, and feature requests are welcome! Feel free to check the [Issues page](https://www.google.com/search?q=https://github.com/YoshiakiKoizumija142397/MethodDka/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 ライセンス / License

**日本語:**

本ソフトウェアは **MIT ライセンス** のもとで公開されています。詳細は `REQUIREMENTS.md` をご覧ください。

**English:**

Distributed under the **MIT License**. See `REQUIREMENTS.md` for full license text.

```text
Copyright (c) 2026 Yoshiaki Koizumi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

```

---

## 👨‍💻 開発者情報 / Author & Contact

* **開発者 (Author):** Yoshiaki Koizumi (小泉嘉章)
* **GitHub:** [@YoshiakiKoizumija142397](https://www.google.com/search?q=https://github.com/YoshiakiKoizumija142397)
* **著作権 (Copyright):** Copyright © 2026 Yoshiaki Koizumi. All rights reserved.

```