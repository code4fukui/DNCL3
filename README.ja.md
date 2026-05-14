# DNCL3

DNCL3は、高校のアルゴリズムおよびプログラミング教育用に設計された手続き記述言語です。

## デモ
- DNCL3実行環境: [DNCL3 Runtime](https://code4fukui.github.io/DNCL3/)
- HTMLへのDNCL3組み込み例: [DNCL on web](https://code4fukui.github.io/DNCL3/dnclweb.html)

## 特徴
- 変数、算術/論理演算、条件分岐、繰り返し処理をサポート
- 関数の定義と呼び出しが可能（日本語名にも対応）
- 入出力やユーティリティ操作用の組み込み関数を提供
- 多次元配列をサポート
- 実行用のコマンドラインインターフェース（CLI）を提供

## 必要条件
DNCL3はブラウザ環境で動作するほか、Denoを使用して実行することも可能です。

## 使い方
ブラウザでDNCL3コードを実行する場合:
```html
<script type="module" src="https://code4fukui.github.io/DNCL3/web.js"></script>
<script type="text/dncl">
  // ここにDNCL3コードを記述
</script>
```

CLIを使用してDNCL3コードを実行する場合:
```sh
deno -A https://code4fukui.github.io/DNCL3/cli.js examples/bmi.dncl
```

## ライセンス
MIT License — 詳細は[LICENSE](LICENSE)を参照してください。
