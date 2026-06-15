# ひなちゃんとにじいろマーメイドのぼうけん

5歳向けの横画面Webゲームです。
人魚がやさしい海を泳ぎ、カメさんのおねがい「ピンクのかいがらを 3こ あつめる」を達成します。

## 使用技術

- React
- TypeScript
- Vite
- Phaser
- localStorage

## 起動方法

```bash
npm install
npm run dev
```

PowerShellで `npm.ps1` の実行が止まる場合は、次を使ってください。

```powershell
npm.cmd install
npm.cmd run dev
```

Androidタブレットでは横向きで遊ぶ想定です。

## ビルド

```bash
npm run build
npm run preview
```

## GitHub Pages公開方法

`vite.config.ts` では、`GITHUB_PAGES=true` のときだけ `base` が `/mermaid-adventure/` になります。

```powershell
$env:GITHUB_PAGES="true"
npm.cmd run build
npm.cmd run deploy
```

GitHubのリポジトリ名を変える場合は、`vite.config.ts` の `/mermaid-adventure/` を公開先リポジトリ名に合わせて変更してください。

## 操作

- 画面左下の大きな4方向ボタン: 上下左右に泳ぐ
- キーボード: `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight`
- キーボード: `W` / `A` / `S` / `D`

斜め移動にも対応しています。移動時に速くなりすぎないよう、移動ベクトルを正規化しています。

## 横スクロールステージ

メイン海ステージは `5120 x 720` のワールド幅で動きます。
カメラは人魚を追従し、上部UI・なかまボタン・方向キーは画面固定です。

カメNPC、貝殻、真珠、宝箱、サンゴ、魚はワールド全体に分散配置しています。

## 背景画像

高品質背景を使う場合は、以下に配置してください。

```txt
src/assets/images/backgrounds/sea-background.png
```

推奨サイズ:

- 1枚背景: `3840 x 720` または `5120 x 720`
- 分割背景: `1280 x 720` を3〜4枚
- 形式: PNG または WebP

現在の実装では `sea-background.png` を `seaBackground` として読み込みます。
画像が `1280 x 720` の場合は横方向に複数枚並べて表示します。
画像がない場合は、簡易背景へ自動フォールバックします。

将来的に複数背景にする場合は、`BootScene.ts` で次のようなキーを追加し、`MainSeaScene.ts` の背景配置処理で順番に並べる形に拡張してください。

```txt
sea-background-1.png
sea-background-2.png
sea-background-3.png
```

## 追加画像の差し替え

以下のPNGを `src/assets/images/` 配下に置くと、ゲーム内で画像として読み込まれます。
画像がない場合は簡易表示にフォールバックします。

```txt
src/assets/images/kame.png
src/assets/images/oshiro.png
```

- `kame.png`: カメNPC
- `oshiro.png`: うみのおしろ

すでに読み込んでいる主な画像:

- `mermaid.png`: 人魚
- `kumanomi.png`: クマノミ
- `aoisakana.png`: あおいさかな
- `pinkusakana.png`: ピンクのさかな
- `kaigara.png`: ピンクの貝殻
- `shinju.png`: 真珠
- `takarabako.png`: 宝箱
- `sango.png`: サンゴ
- `awa.png`: 泡
- `pink_hanakazari.png`: 髪飾り
- `kinnothiara.png`: ティアラ

## 仲間魚

- 初期状態で `クマノミ` が解放済みです。
- 右上の `なかま` ボタンから、ついてくる魚を選べます。
- 最大3匹まで選択できます。
- おつかい達成や宝箱報酬で、新しい魚が解放されます。

## おきがえ

現在は無効化しています。
将来復活できるよう、型・保存データ・画像素材・画面コンポーネントは残しています。
ゲーム中の尾びれ、髪飾り、ティアラの追加表示も停止しています。

## 報酬

おつかい達成時、または宝箱取得時に、以下の順で報酬が付与されます。

1. 未解放の仲間魚
2. キラキラポイント

## おみせ

タイトル画面とゲーム画面右上の `おみせ` から、キラキラポイントを使って買い物できます。

- `あたらしい うみ`: 購入すると `うみをえらぶ` でステージ背景を切り替えられます。
- `うみの おしろ`: 購入すると `おしろをえらぶ` で海ステージ内に飾れます。
- 購入前には確認画面が出ます。
- キラキラが足りない商品は、やさしいメッセージを表示して購入しません。
- 購入済みの商品は `かったよ！` と表示され、再購入できません。

商品データは `src/types/shop.ts` で管理しています。
商品を増やす場合は、次の形式で `STAGE_SHOP_ITEMS` または `CASTLE_SHOP_ITEMS` に追加してください。

```ts
{
  id: 'stage_example',
  type: 'stage',
  name: 'あたらしい うみ',
  description: 'せつめい',
  price: 300,
  imageKey: 'stageExample',
}
```

購入処理と選択処理は `src/game/systems/shopSystem.ts` にまとめています。

## ステージ背景画像

追加ステージの背景画像は、以下に置く想定です。

```txt
src/assets/images/backgrounds/stage-jellyfish-sea.png
src/assets/images/backgrounds/stage-rainbow-sea.png
src/assets/images/backgrounds/stage-star-sea.png
```

画像がない場合でも、`BootScene.ts` が仮のグラデーション背景を生成します。
本番画像を追加したら、`BootScene.ts` の `stageBackgrounds` と `MainSeaScene.ts` の `stageTextureKeys` のキーを合わせてください。

## おしろ画像

おしろ画像は、以下のファイル名で `src/assets/images/` に置くと自動で読み込まれます。

```txt
src/assets/images/castleSmall.png
src/assets/images/castlePearl.png
src/assets/images/castleRainbow.png
```

画像がない場合でも、`BootScene.ts` で仮テクスチャを生成します。

```txt
castleSmall
castlePearl
castleRainbow
```

本番用のPNGへ差し替える場合は、同じファイル名で上書きしてください。
`src/types/shop.ts` の `imageKey`、`src/components/shopPreviewAssets.ts`、`MainSeaScene.ts` の `castleTextureKeys` は同じキー名で揃えています。

## 保存データ

localStorageのキー名は以下です。

```ts
mermaid-save-data
```

保存内容は `src/types/saveData.ts` の `SaveData` で管理しています。
既存データを消さないように、`src/game/systems/saveSystem.ts` の `migrateSaveData` で不足項目を補完します。

おみせ機能で追加された保存項目:

- `purchasedItemIds`: 購入済みの商品ID
- `selectedStageId`: 選択中の海ステージID
- `selectedCastleId`: 選択中のおしろID

既存のlocalStorageにこれらの項目がない場合は、次の初期値で補完されます。

```ts
{
  purchasedItemIds: [],
  selectedStageId: 'stage_default',
  selectedCastleId: 'none',
}
```

## 素材差し替え方法

本番用PNGに差し替える場合は、以下の流れで進めます。

1. `src/assets/images/` にPNGを置く
2. `BootScene.ts` で `this.load.image(...)` を使って読み込む
3. Scene内やカタログ内の `imageKey` をPNGのキー名に合わせる

画像を差し替えたら、`npm.cmd run build` で確認してください。
# BGM

BGMファイルは次の場所に置きます。

```txt
src/assets/audio/mermaid_underwater_bgm.wav
```

対応形式の優先順位は `mp3` → `ogg` → `wav` です。将来的に軽量化したい場合は、同じ名前で `mermaid_underwater_bgm.mp3` または `mermaid_underwater_bgm.ogg` を追加すると優先して読み込まれます。

BGM設定はゲーム画面右上の `BGM` ボタンから変更できます。

- 初期状態: ON
- 初期音量: `0.25`
- 保存場所: localStorage の `mermaid-save-data`
- 保存項目: `audioSettings.bgmEnabled` / `audioSettings.bgmVolume`

既存セーブデータに `audioSettings` がない場合は、`src/game/systems/saveSystem.ts` の `migrateSaveData` で初期値が補完されます。

効果音を追加するときは、`src/game/audio/audioKeys.ts` にキーを追加し、`src/game/audio/AudioManager.ts` に再生関数を足してください。貝殻取得、宝箱、仲間魚解放、おきがえなどはこの構成から拡張できます。

