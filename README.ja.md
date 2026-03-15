# DNCL3

DNCL3は高校向けのアルゴリズムとプログラミング教育用に設計された手続き記述言語です。

## デモ
- DNCL3ランタイム環境: [DNCL3 Runtime](https://code4fukui.github.io/DNCL3/)
- HTMLへのDNCL3埋め込み例: [DNCL on web](https://code4fukui.github.io/DNCL3/dnclweb.html)

## 機能
- 変数、算術/論理演算、条件文、ループをサポート
- 日本語の関数定義と呼び出しが可能
- 入出力や汎用操作の組み込み関数を提供
- 多次元配列に対応
- コマンドラインインターフェイス(CLI)による実行が可能

## 必要環境
DNCL3はブラウザ環境で実行可能、またはDenoを使って実行できます。

## 使い方
ブラウザでDNCL3コードを実行する:
```html
<script type="module" src="https://code4fukui.github.io/DNCL3/web.js"></script>
<script type="text/dncl">
  // DNCL3コードはここに
</script>
```

CLIでDNCL3コードを実行する:
```sh
deno -A https://code4fukui.github.io/DNCL3/cli.js examples/bmi.dncl
```

## ライセンス
DNCL3はオープンソースプロジェクトで、ライセンスは特に定められていません。