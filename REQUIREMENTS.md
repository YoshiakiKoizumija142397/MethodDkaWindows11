# ソフトウェア開発要求仕様書 (SOFTWARE REQUIREMENTS SPECIFICATION)

**プロジェクト名:** MethodDka (200桁極限高精度多項式解法・因数分解 Web / Windows アプリケーション)  
**バージョン:** v3.2.0  
**最終改訂日:** 2026年8月23日  
**開発者 / 権利者:** Yoshiaki Koizumi (小泉嘉章)  
**ライセンス:** MIT License  

---

## 1. プロジェクト概要 (Overview)

本プロジェクトは、Durand-Kerner-Aberth (DKA) 法と `Decimal.js` を組み合わせ、高次・悪条件多項式（例：20次ウィルキンソン多項式等）に対して **200桁固定の極限高精度** で全複素解の算出および因数分解を行う Web / ネイティブアプリケーション開発を目的とする。

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
- **完全クライアントサイド動作:** 全ての多項式評価および DKA 反復計算はユーザーのブラウザ・端末ローカル環境内で完結し、入力係数や算出解が外部サーバーへ送信・記録されることは一切ない。

---

## 4. 機能要求仕様 (Functional Requirements)

### 4.1 精度・アルゴリズム要件
1. **200桁固定精度演算:** `Decimal.set({ precision: 200 })` を適用し、演算中の丸め誤差を排除する。
2. **正統派 DKA ＋ オートスケーリング演算:** 
   - オートスケーリング因子 $S_x = \left(\frac{\vert{}a_0\vert{}}{\vert{}a_n\vert{}}\right)^{1/n}$ を算出。
   - スケーリング空間 $y = x / S_x$ におけるモニック多項式 $P_s(y) = y^n + C_1 y^{n-1} + \dots + C_n$ を正規化生成。
   - スケーリング空間上で Aberth 初期値を配置し、DKA 反復 $\Delta z_i = \frac{P_s(z_i)}{\prod_{j \neq i} (z_i - z_j)}$ を実行。
   - 収束解から実空間上の真の解 $x_i = z_i \cdot S_x$ を復元。
3. **収束条件 ＆ セーフティロック:** 
   - 個別解の補正量 $\Delta z_i < 10^{-180}$ を満たした時点で該当解を完全収束（⭕）と判定。
   - 20,000 回の最大反復セーフティロックを設ける。

### 4.2 係数入力 ＆ 解析機能
1. **最高次数指定:** 最大 200 次までの任意次数 $n$ を指定可能。
2. **一括ペースト機能 (`applyBulk`):** 
   - カンマまたは空白区切りの係数文字列（降順 $a_n, a_{n-1}, \dots, a_0$）を解析し、各入力欄 `coeff-k`（$x^k$ の係数）へ正しく割り振る。

### 4.3 進捗表示 ＆ リアルタイムUI
1. **リアルタイム計測:** 経過時間（`00:00:00` 形式）、推定残り時間、ループ数、最悪誤差半径を追跡。
2. **進捗率 ＆ 反復回数定義:** 
   - 演算完了時、進捗率 UI パネルは **100.0%** へ完全同期描画する。
   - **解ごとの個別反復回数:** 各解 $z_i$ が収束条件に達した時点の反復ループ数を記録。
   - **総反復回数 (Total Iterations):** 各解の個別反復回数の全合計（$\sum \text{perRootIter}_i$）を集計・出力する。

### 4.4 モード切替トグルボタン仕様 (Mode Switching Specifications)
計算完了後、算出された高精度解データ（200桁キャッシュ）を破棄・再計算することなく、**トグルスイッチの切替のみで非破壊かつリアルタイムに表示モードを変更**できること。

1. **高精度解法表示モード (High Precision Solver Mode) [デフォルト]:**
   - **概要:** 各解の完全精度数値をそのまま出力する。
   - **出力内容:** 解番号、完全収束マーク（⭕）、実部（100桁）、虚部（100桁）、誤差半径、個別反復回数。
2. **因数分解専用モード (Factorization Only Mode):**
   - **概要:** 算出された複素解をもとに、多項式の因数分解形式 $P(x) = a_n \prod_{i=1}^n (x - z_i)$ を生成・出力する。
   - **非破壊・四捨五入処理:** 保持されている200桁の解データ自体は維持し、表示時のみ各解の実部・虚部を**小数点第1位で四捨五入（整数化）**して $(x - z_i)$ の因数式を組み立てる。
   - **トグル復帰:** トグルボタンを元に戻すと、保持されていた200桁の高精度解表示へ一瞬で復帰する。

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
| **v3.2.0** | 2026年8月23日 | **[最新版]** 高精度解法/因数分解モード切替トグルスイッチ追加、解ごとの個別反復回数集計（総反復回数定義更新）、バイリンガル（日/英）多言語対応、開発者・MITライセンス明記 | Yoshiaki Koizumi |

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
# MethodDka (v3.2.0)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.2.0-green.svg)](https://github.com/YoshiakiKoizumija142397/MethodDka)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Windows%2011-lightgrey.svg)](https://github.com/YoshiakiKoizumija142397/MethodDka)

**200桁固定の超高精度演算で悪条件多項式を解く、100%クライアントサイドWeb/Windowsアプリケーション**  
*A high-performance, 100% client-side web and Windows application designed to solve high-degree ill-conditioned polynomials with 200-digit fixed precision.*

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
MethodDka は、数値解析分野における最も過酷な問題の一つである「悪条件多項式（例：20次ウィルキンソン多項式等）」の全複素解を、**200桁固定の極限高精度**で高速・正確に算出するWeb/ネイティブアプリケーションです。  
`Decimal.js` による200桁浮動小数点演算と、自動係数スケーリング機構（$S_x$）を組み合わせることで、オーバーフローや桁落ちを防ぎ、最高200次までの多項式を完璧に解きます。

**English:**  
MethodDka addresses one of the most challenging problems in numerical analysis: accurately computing all complex roots of ill-conditioned polynomials without numerical overflow, underflow, or precision degradation.  
By leveraging an extended **200-digit floating-point arithmetic pipeline** alongside an automatic coefficient scaling mechanism ($S_x$), MethodDka rapidly converges to exact solutions for polynomials up to degree $n = 200$.

---

## ✨ 主な特徴 / Key Features

**日本語:**  
- **ダイレクト200桁極限精度演算:** `Decimal.js` を用いた200桁固定精度で計算を実行し、丸め誤差を徹底排除。
- **オートスケーリング機構 ($S_x$):** 係数の桁数爆発・アンダーフローを防止する正規化アルゴリズムを標準搭載。
- **リアルタイム処理状況追跡:** ループ進捗率（%）、経過時間、推定残り時間、最悪誤差半径をリアルタイム描画。
- **非破壊モード切替トグルスイッチ:**
  - **高精度解法表示モード:** 各解の数値（実部・虚部100桁出力）、誤差半径、個別反復回数を表示。
  - **因数分解専用モード:** 解を四捨五入（整数化）し、多項式の因数分解形式 $P(x) = a_n \prod (x - z_i)$ を生成。
- **100%クライアントサイド動作:** データは外部サーバーに一切送信されず、端末内（オフライン）で完結。
- **バイリンガルUI:** 画面右上のボタンで「日本語 ⇔ English」をワンクリック即座切替。

**English:**  
- **Direct 200-Digit Precision Arithmetic:** Powered by `Decimal.js` set to 200 digits of fixed precision.
- **Auto-Scaling Mechanism ($S_x$):** Prevents numeric overflow/underflow when computing high-degree polynomials.
- **Real-Time Execution Tracking:** Live progress bar, loop counts, elapsed execution time, and estimated time remaining.
- **Dual Display Mode (Non-Destructive Toggle):**
  - **High Precision Solver Mode:** Displays all real/imaginary parts (up to 100 decimal places), error radii, and individual root iteration counts.
  - **Factorization Mode:** Non-destructively rounds roots to nearest integers to generate factored forms $P(x) = a_n \prod (x - z_i)$.
- **100% Offline & Client-Side Execution:** Zero data transmitted to external servers; total privacy and security.
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
3. **計算開始:** 「🚀 200桁高精度計算開始！」ボタンを押して反復計算を開始します。
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

* **オートスケーリング因子 (Auto-Scaling Factor):** $S_x = \left\vert{} \frac{a_0}{a_n} \right\vert{}^{1/n}$
* **収束判定条件 (Convergence Criterion):** $\vert{}\Delta z_i\vert{} < 10^{-180}$
* **セーフティロック (Max Loop Cap):** 20,000 Loops

---

## 📁 プロジェクト構成 / Project Structure

```text
MethodDka/
├── index.html        # Webランディングページ / Main landing page
├── MethodDka.html    # 200桁高精度計算アプリ本体 / Core polynomial solver app
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