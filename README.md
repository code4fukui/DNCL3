# 手順記述言語 (DNCL3) の仕様

高等学校におけるアルゴリズムやプログラムに関する教育では，採用されるプログラミング言語は多様で，プログラミングの実習時間も異なります。このような事情を考慮し，[DNCL](https://github.com/code4fukui/DNCL)、[DNCL2](https://github.com/code4fukui/DNCL2)を踏まえた、手順記述言語 (DNCL3) を定義します。

- 例: BMI計算 [examples/bmi.dncl](examples/bmi.dncl)
```sh
deno run -A DNCL3.example.js bmi
```

- ブラウザで動作するテスト環境 [dncl2js](https://code4fukui.github.io/DNCL3/dncl2js.html)

※ TODO: 下記は未実装です
- [二次元以上の配列](https://github.com/code4fukui/DNCL3/issues/2) / [配列のすべてを初期化](https://github.com/code4fukui/DNCL3/issues/3) / [input](https://github.com/code4fukui/DNCL3/issues/7) / [変数のスコープ](https://github.com/code4fukui/DNCL3/issues/13)

## 1 変数と値

変数名は，英字で始まる英数字と『 _ 』の並びです。ただし、予約語（print, input, and, or, not, if, else, while, do, until, for, to, step, break, function, return）は変数名として使用できません。

- 例: n, sum, Tokuten

小文字で始まる変数は通常の変数を表し，大文字で始まり小文字を含む2文字以上の変数は配列を表します。また，すべて大文字の変数は実行中に変化しない値を表します。

配列の要素は，0から始まる要素の番号を添字で指定します。2次元以上の場合は，添字を『,』で区切ります。たとえば，(1次元の) 配列 Tokuten や 2次元配列 Gyoretu の要素は Tokuten[2] や Gyoretu[3, 2] のように表します。

数値は10進法で表します。文字列は，文字の並びを『 " 』と『 " 』でくくって表します。

- 例: 100
- 例: 99.999
- 例: "見つかりました"
- 例: "It was found."

文字列に0から始まる要素番号を添字で指定すると、先頭が0とした文字を文字列として返します。もし、添字が文字列の範囲外の場合、空文字列 "" を返します。

```
s = "ABC"
print s[0],s[2] # A C と表示される
```

## 2 表示文

『print』を使って，表示文で数値や文字列や変数の値を表示します。複数の値を表示する場合は『,』で区切って並べます。何も指定しないと1行空きます。

- 例: print n （nが15のとき「15」と表示されます。）
- 例: print "整いました" （「整いました」と表示されます。）
- 例: print kosu, "個見つかった" （kosu が 3 のとき，「3 個見つかった」と表示されます。）
- 例: print "(", x, "，", y, ")" （x が 5，y が −1 のとき，「(5，-1)」と表示されます。）
- 例: print （1行空きます。）

## 3 代入文

代入文は変数に値を設定します。『=』の左辺に変数または添字付きの配列を，右辺に代入する値を書きます。

- 例: kosu = 3
- 例: Tokuten[4] = 100

使用されている配列の要素に同じ値をまとめて代入することができます

- 例: Tokuten = 0

「[」「]」と「,」を使用し、要素のの値をまとめて指定することで，置き換えることができます。

- 例: Tokuten = [87, 45, 72, 100]

複数の代入文を，『,』で区切りながら，横に並べることができます。この場合は，代入文は左から順に実行されます。

- 例: kosu_gokei = kosu，tokuten = kosu * (kosu + 1)

外部から入力された値を代入するために，次のように記述することができます。

- 例: input x
- 例: input "0から100までの好きな数を入力してください", x

## 4 演算

この節では，算術演算と比較演算，そして論理演算について説明します。比較演算やそれを組み合わせる論理演算は，条件分岐文（5.1 節）や条件繰返し文（5.2 節）の〈条件〉で使うことができます。

### 4.1 算術演算

加減乗除の四則演算は，『+』，『-』，『*』，『/』で指定します。

整数の除算では，商を『//』で，余りを『%』で計算することができます。

- 例: atai = 7 / 2 　 （atai には 3.5 が代入されます。）
- 例: syo = 7 // 2 　 （syo には 3 が代入されます。）
- 例: amari = 10 % 3 （amari には 1 が代入されます。）

複数の演算子を使った式の計算では，基本的に左側の演算子が先に計算されますが，『*』，『/』，『//』，『%』は，『+』，『-』より先に計算されます。また，丸括弧『(』と『)』で式をくくって，演算の順序を明示することができます。

- 例: sogaku = ne1 - ne2 - ne3 は，sogaku = (ne1 - ne2) - ne3 と同じです。
- 例: kosu = 1 + kazu // 3 は，kosu = 1 + (kazu // 3) と同じです。
- 例: heikin = (hidari + migi) // 2 は，heikin = hidari + migi // 2 と異なります。

文字列の算術演算は『+』のみ使用することができます。前後のいずれかが文字列の場合，文字列として連結します。

### 4.2 比較演算

数値の比較演算は，『==』，『!=』，『>』，『>=』，『<=』，『<』で指定します。演算結果は，真か偽の値となります。

- 例: kosu > 3 （kosu が 3 より大きければ真となります。）
- 例: ninzu * 2 <= 8 （ninzu の 2 倍が 8 以下であれば真となります。）
- 例: kaisu != 0 （kaisu が 0 でなければ真となります。）

文字列の比較演算は，『==』，『!=』を利用することができます。『==』は，左辺と右辺が同じ文字列の場合に真となり，それ以外の場合は偽となります。『!=』は，左辺と右辺が異なる文字列の場合に真となり，それ以外の場合（同じ文字列の場合）は偽となります。

- 例: "あいうえお" == "あいうえお" （真となります。）
- 例: "あいうえお" == "あいう" （偽となります。）
- 例: "ABC" == " ABC" （真となります。）
- 例: "ABC" == "abc" （偽となります。）
- 例: "あいうえお" != "あいうえお" （偽となります。）
- 例: "あいうえお" !=  "あいう" （真となります。）
- 例: "ABC" != "ABC" （偽となります。）
- 例: "ABC" != "abc" （真となります。）

### 4.3 論理演算

論理演算は，真か偽を返す式に対する演算で，『and』，『or』，『not』の演算子で指定します。『not』，『and』，『or』の順で，同一の演算子の場合は左が優先されますが，丸括弧『(』と『)』で，演算の順序を指定することができます。

『〈式 1〉 and 〈式 2〉』は，〈式 1〉と〈式 2〉の結果がいずれも真である場合に真となり，それ以外の場合は偽となります。『〈式 1〉 or 〈式 2〉』は，〈式 1〉と〈式 2〉の結果のどちらかが真である場合に真となり，それ以外の場合は偽となります。『not 〈式〉』は， 〈式〉 の結果が真である場合に偽となり，偽の場合は真となります。

- 例: kosu >= 12 and kosu <= 27 （kosu が 12 以上 27 以下なら真となります。）
- 例: kosu % 2 == 0 or kosu < 0 （kosu が偶数か負の値なら真となります。）
- 例: not kosu > 75 （kosu が 75 より大きくなければ真となります。）
- 例: kosu > 12 and not kosu < 27 でない は，kosu > 12 and (not kosu < 27) と同じです。
- 例: not kosu > 12 and kosu < 27 でない は，(not kosu > 12) and kosu < 27 と同じです。
- 例: kosu == 0 or kosu > 12 and kosu < 27 は，kosu == 0 or (kosu > 12 and kosu < 27) と同じです。（『and』が先に実行されるため。）

## 5 制御文

条件分岐文（5.1 節）や条件繰返し文（5.2 節），順次繰返し文（5.3 節）をまとめて制御文と呼びます。制御文の中の 〈処理〉 として，表示文（2 節），代入文（3 節），値を返さない関数（6.2 節），条件分岐文，順次繰返し文，条件繰返し文を，一つ以上並べて使うことができます。また，条件分岐文や条件繰返し文の中の〈条件〉として，比較演算（4.2 節）と論理演算（4.3 節）を使用することができます。

### 5.1 条件分岐文

条件分岐文は， 〈条件〉 が真かどうかによって，実行する処理を切り替えます。

〈条件〉の値が真のときにある処理を実行し，〈条件〉の値が偽のときに実行する処理がない場合は，次のように指定します。

《一般形》
```
if 〈条件〉 {
  〈処理〉
}
```

例:
```
if x < 3 {
  x = x + 1
  y = y - 1
}
```

〈条件〉の値が真のときにある処理を実行し，〈条件〉の値が偽のときに別の処理を実行する場合は，次のように『else』を組み合わせて指定します。

《一般形》
```
if 〈条件〉 {
  〈処理 1〉
} else {
  〈処理 2〉
}
```

例:
```
if x < 3 {
  x = x + 1
} else {
  x = x - 1
}
```

条件分岐の中で複数の条件で実行する処理を切り替えたい場合は，次のように『else if』を使って条件を追加します。

《一般形》
```
if 〈条件 1〉 {
  〈処理 1〉
} else if 〈条件 2〉 {
  〈処理 2〉
} else {
  〈処理 3〉
}
```

例:
```
if x == 3 {
  x = x + 1
} else if y > 2 {
  y = y + 1
} else {
  y = y - 1
}
```

### 5.2 条件繰返し文

条件繰返し文には，「前判定」と「後判定」の 2 種類があります。

#### 5.2.1 前判定

〈条件〉 が真の間， 〈処理〉 を繰り返し実行します。

〈処理〉を実行する前に 〈条件〉が成り立つかどうか判定されるため，〈処理〉が1回も実行されないことがあります。

《一般形》
```
while 〈条件〉 {
  〈処理〉
}
```

例:
```
while x < 10 {
  gokei = gokei + x
  x = x + 1
}
```

#### 5.2.2 後判定

〈条件〉 が真になるまで， 〈処理〉 を繰り返し実行します。

〈処理〉を実行した後に 〈条件〉が成り立つかどうか判定されるため，〈処理〉は少なくとも 1 回は実行されます。

《一般形》
```
do {
  〈処理〉
} until 〈条件〉
```

例:
```
do {
  gokei = gokei + x
  x = x + 1
} until x >= 10
```

### 5.3 順次繰返し文

順次繰返し文は， 〈変数〉 の値を増やしながら， 〈処理〉 を繰返し実行します。

《一般形》
```
for 〈変数〉 = 〈初期値〉 to 〈終了値〉 step 〈差分〉 {
  〈処理〉
}
```

順次繰り返し文は，以下の手順で実行されます。
1. 〈変数〉 に 〈初期値〉 が代入されます。
2. 〈変数〉 の値が 〈終了値〉 よりも大きければ，繰り返しを終了します。
3. 〈処理〉 を実行し， 〈変数〉 の値に 〈差分〉 を加え，手順 2 に戻ります。

例:
```
for x = 1 to 10 step 1 {
  gokei = gokei + x
}
```

〈差分〉が1の場合，step以降を省略できます。

例:
```
for x = 1 to 10 {
  gokei = gokei + x
}
```

〈差分〉にマイナスの値を指定すると，〈変数〉の値を〈初期値〉から減らしながら，その値が 〈終了値〉 よりも小さくなるまで， 〈処理〉 を繰り返し実行します。

例:
```
for x = 10 to 1 step -1 {
  gokei = gokei + x
}
```

### 5.4 繰返しの中断

繰返し文中で，break を使用すると繰返しを中断します。

《一般形》
```
for 〈変数〉 = 〈初期値〉 to 〈終了値〉 step 〈差分〉 {
  if 〈条件〉 {
    break
  }
  〈処理〉
}
```

## 6 関数の呼び出し

関数には，値を返すものと値を返さないものがあります。

### 6.1 値を返す関数

問題文の中で

- 指定された値 x の二乗の値を返す関数「二乗(x)」を用意する
- 値 m の n 乗の値を返す関数「べき乗(m，n)」を用意する
- 値 m 以上値 n 以下の整数をランダムに一つ返す関数「乱数(m，n)」を用意する
- 値 n が奇数のとき真を返し，そうでないとき偽を返す関数「奇数(n)」を用意する

のように定義された関数を，表示文 (2 節)，代入文 (3 節)，算術演算（4.1 節），比較演算（4.2 節），あるいは論理演算（4.3 節）の中で使うことができます。関数を呼び出すときは，関数名に続き，『(』と『)』の間に引数を書きます。複数の引数を指定する場合は，『，』で区切ります。

- 例: y = 二乗(x) # y に x の二乗が代入されます。
- 例: z = 二乗(x) ＋ べき乗(x，y) # z に x の二乗と x の y 乗の和が代入されます。
- 例: r = 乱数(1，6) # r に 1 から 6 までの整数のうちいずれかが代入されます。

### 6.2 値を返さない関数

問題文の中で

- 指定された値 n を2進法で表示する関数「二進法で表示する(n)」を用意する

のように値を返さない関数が定義されることがあります。

- 例: 二進法で表示する(11) #「1011」と表示されます。

## 7 新しい関数の定義

新しい関数の定義は，DNCL3を用いて次のように記述します。

《一般形》
```
function 〈関数名〉( 〈引数列〉 ) {
  〈処理〉
}
```

関数が呼び出される時に引数として与えられる値は、引数列のところに書いた変数名で利用します。複数の引数を指定する場合は，『，』で区切ります。定義した関数は，用意された関数の呼び出し（6 節）と同じ記法で呼び出すことができます。

関数内では関数外の変数は使用できません。関数内で使用される変数は関数外では使用できません。

例: 1 から正の整数 n までの和を表示する関数「和を表示する(n)」の定義例
```
function 和を表示する(n) {
  wa = 0
  for i = 1 to n {
    wa = wa + i
  }
  print wa
}
```

例: 値 m の n 乗の値を表示する関数「べき乗を表示する(m, n)」の定義例
```
function べき乗を表示する(m, n) {
  p = 1
  for i = 1 to n {
    p = p * m
  }
  print p
}
```

「return」を使用して値を返す関数を定義することができます。値を指定せずに「return」を使用すると値を返さず関数内の処理を終えることができます。

例: 値 m の n 乗の値を返す関数「べき乗(m, n)」の定義例
```
function べき乗(m, n) {
  p = 1
  for i = 1 to n {
    p = p * m
  }
  return p
}
```

## 8 コメント

```
atai = 乱数() # 0以上1未満のランダムな小数をataiに代入する
```
- ※1行内において#以降の記述は処理の対象とならない

```
#=
複数行に渡る
コメントの記述方法
=#
```

- #= から =# までの記述は処理の対象とならない

## reference

- [共通テスト手順記述標準言語 (DNCL) の説明 独立行政法人大学入試センター 2022年1月](https://www.dnc.ac.jp/albums/abm.php?d=67&f=abm00000819.pdf&n=R4_%E5%85%B1%E9%80%9A%E3%83%86%E3%82%B9%E3%83%88%E6%89%8B%E9%A0%86%E8%A8%98%E8%BF%B0%E6%A8%99%E6%BA%96%E8%A8%80%E8%AA%9E%EF%BC%88DNCL%EF%BC%89%E3%81%AE%E8%AA%AC%E6%98%8E.pdf)
- [令和７年度大学入学共通テスト 試作問題「情報」の概要 独立行政法人大学入試センター](https://www.dnc.ac.jp/albums/abm.php?d=511&f=abm00003141.pdf&n=6-1_%E6%A6%82%E8%A6%81%E3%80%8C%E6%83%85%E5%A0%B1%E3%80%8D.pdf)
