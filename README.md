# Wingscraft — ファイル案内 / File Guide

## 日本語

静的HTML・CSS・JavaScriptで構成したサイトです。ビルドは不要で、このフォルダ内のファイル構成を保ったまま公開できます。

- 検索は **⌘K / Ctrl+K** で開き、Escapeまたは閉じるボタンで終了します。ヘッダーには検索欄を表示しません。
- ノートは見出しを選ぶと本文が開きます。JavaScriptが無効でも読めます。
- 日本語環境では日本語、それ以外では英語を初期表示します。言語切替後は`?lang=ja`または`?lang=en`をURLと内部リンクに保持します。
- 問い合わせフォームはFormspreeに接続済みです。JavaScriptが無効でもFormspreeへ通常送信できます。デモ画面は実際のメール送信や予約を行いません。
- ページ本文のドラッグ選択・コピーは無効です。フォームの入力欄では通常どおり選択・コピーできます。これは一般的な操作を抑えるもので、画面撮影や開発者ツールからの取得を防ぐものではありません。
- 文章を変更する場合は、HTMLの日英両方と、関連するJavaScript内の日英文言を一緒に更新してください。
- CSSやJavaScriptを更新した場合は、HTML内のURL末尾のバージョンと、`sw.js`のキャッシュ名・事前取得URLも更新してください。
- 公開ドメインを変更する場合は、各HTMLのcanonical・OG・構造化データ、`robots.txt`、`sitemap.xml`も更新してください。
- モニター枠は自動集計されません。受付状況に合わせて`services.html`を更新してください。
- ローカル確認は、このフォルダで `python3 -m http.server 8000` を実行し、`http://localhost:8000`を開きます。

## English

This is a static HTML, CSS and JavaScript website. No build step is required. Publish the files together while preserving their relative paths.

- Search opens with **Command+K / Ctrl+K** and closes with Escape or the close button. No search field is shown in the header.
- Select a note heading to read its body. The notes remain readable without JavaScript.
- Japanese browsers default to Japanese; all others default to English. Language switching keeps `?lang=ja` or `?lang=en` in the URL and internal links.
- The inquiry form is connected to Formspree and retains a standard HTML submission when JavaScript is unavailable. Demo screens do not send real messages or create real bookings.
- Drag selection and copying are disabled for page content. Form fields remain selectable and copyable. This only blocks ordinary browser interaction; it does not prevent screenshots or access through developer tools.
- When editing copy, update both language spans in HTML and related strings in JavaScript.
- When updating CSS or JavaScript, revise the asset query versions in HTML and the cache name and precache URLs in `sw.js` together.
- A domain change also requires updates to canonical, OG and structured-data URLs in HTML, plus `robots.txt` and `sitemap.xml`.
- Pilot availability is not tracked automatically. Update `services.html` as places are filled.
- To preview locally, run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`.

## ファイル一覧 / File List

| File | 日本語 | English |
| --- | --- | --- |
| `index.html` | ホーム、自動転記デモ、サービスと制作例の概要 | Home, automatic-entry demo, and service/work overview |
| `services.html` | サービス、各5件のモニター料金、制作手順、FAQ | Services, five pilot places per service, process and FAQs |
| `examples.html` | 3つの自主制作デモ一覧 | Index of three independent demos |
| `projects.html` | Wingscraft Bookingの構想と画面例 | Wingscraft Booking concept and interface study |
| `journal.html` | 開閉して読める日英の制作ノート | Expandable bilingual notes |
| `about.html` | スタジオ概要、会社情報、創業者と担当 | Studio profile, company details and founder responsibilities |
| `contact.html` | 問い合わせフォーム | Inquiry form |
| `privacy.html` | 情報の取り扱いとブラウザ保存の説明 | Data handling and browser-storage information |
| `404.html` | ページが見つからない場合の案内 | Not-found page |
| `demo-booking.html` | 架空データを使う予約管理デモ | Booking-management demo using fictional data |
| `demo-inquiries.html` | 架空データを使う問い合わせ管理デモ | Inquiry-management demo using fictional data |
| `sample-coffee.html` | 架空のカフェサイト | Fictional café website |
| `style.css` | 共通デザイン、料金・ノート・各ページの画面幅対応 | Shared design and responsive layouts, including pricing and notes |
| `script.js` | 日英切替、ショートカット検索、メールコピーなど | Language switching, keyboard search, email copy and shared controls |
| `navigation.js` | モバイルメニューとキーボード操作 | Mobile menu and keyboard navigation |
| `motion.js` | スクロール演出と「動きを減らす」設定への対応 | Scroll reveals and reduced-motion support |
| `workflow.js` | ホームの自動転記デモ | Home automatic-entry simulation |
| `contact.js` | 入力、一時下書き、テンプレート、送信状態 | Form input, temporary drafts, templates and submission states |
| `contact-transport.js` | Formspree通信と応答確認 | Formspree requests and response validation |
| `site-config.js` | 公開URL、フォーム送信先、任意の解析設定。秘密鍵は置かない | Public URL, form endpoint and optional analytics; no secret keys |
| `demo.js` | 問い合わせ・予約管理デモの操作 | Inquiry and booking demo interactions |
| `demo.css` | 管理デモのデザイン | Management-demo styling |
| `sample.js` | カフェ例の操作と言語切替 | Café-example interactions and language switching |
| `sample.css` | カフェ例のデザイン | Café-example styling |
| `sw.js` | オフライン用キャッシュと更新処理 | Offline cache and update handling |
| `site.webmanifest` | ホーム画面追加用の名称・アイコン設定 | Installable-site name, launch settings and icons |
| `sitemap.xml` | 公開ページ一覧 | Search-engine sitemap |
| `robots.txt` | クローラー向け設定 | Crawler instructions |
| `_headers` | 対応ホスティング用のセキュリティ・キャッシュ設定 | Security and cache headers on supported hosting |
| `assets/logo.svg` | ロゴ | Site wordmark |
| `assets/favicon.svg` | ブラウザタブ用アイコン | Browser-tab icon |
| `assets/apple-touch-icon.png` | ホーム画面用アイコン | Home-screen icon |
| `assets/og.png` | リンク共有画像 | Social-sharing image |
| `README.md` | このファイル | This file |
