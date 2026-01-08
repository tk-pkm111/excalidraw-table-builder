# excalidraw-table-builder

Obsidian の Excalidraw プラグインで使える **Table Builder Script** です。  
「表を作る」＋「線をドラッグしてから自動でレイアウト更新」までをワンコマンドでできます。

- ✅ Table wizard で新規テーブル作成（行数/列数/セルサイズ/色/罫線幅）
- ✅ 罫線を手動で動かした後に、再実行で **行・列のサイズを自動調整**
- ✅ セルや文字が “潰れる” のを避けつつ、後続の行/列をシフトして整列

---

## Requirements

- Obsidian
- Excalidraw plugin **>= 1.8.21**

> スクリプト内で最低バージョンチェックをしています。古い場合は更新してください。

---

## Install (Obsidian / Excalidraw Script)

1. このリポジトリの `table-builder.js` をダウンロード / コピー
2. Vault 内の Excalidraw scripts フォルダへ配置  
   例：
   - `.obsidian/plugins/obsidian-excalidraw-plugin/scripts/`
3. Obsidian を再読み込み（または Excalidraw の scripts をリロード）
4. Excalidraw の Command Palette からスクリプトを実行

> scripts フォルダの場所は環境により異なることがあります。

---

## How it works

このスクリプトは **選択状態**に応じて2つの動作をします。

### 1) Create a new table（新規作成）
テーブル要素を何も選択せずに実行すると、ダイアログが開きます。  
指定した設定で、以下の要素でテーブルを生成します：

- 背景セル（Rect）
- 罫線（Line：行/列）
- 空テキスト（Text：各セルの中央）

### 2) Update an existing table’s layout（レイアウト更新）
テーブル作成後に、**縦線・横線をドラッグして位置を変えた**あとで  
テーブルの一部を選択して再実行すると、レイアウトを自動で更新します。

- 動かした行/列に合わせてセルサイズを調整
- 後続の行/列もシフトして整列
- 他のセルが不自然に “潰れる” のを防ぐ

---

## Usage

### ✅ To create a table（新規作成）
1. テーブル要素を何も選択せずに、Command Palette からこのスクリプトを実行
2. ダイアログで設定を入力して **Create Table** を押す

### ✅ To resize a row / column（行・列サイズ変更）
1. テーブルの縦線 / 横線を **手動でドラッグ**して位置を変更
2. テーブルの要素をどれか1つ選択（線 / セル / テキストのどれでもOK）
3. スクリプトをもう一度実行
4. テーブル全体のレイアウトが自動で更新されます

---

## Notes / Limitations

- このスクリプトは「このスクリプトで作ったテーブル」を前提に動作します  
  （`customData.tableId` / `rowIndex` / `colIndex` を利用）
- テーブル要素を個別に編集しすぎると、意図しない動作になる可能性があります
- うまく動かない場合：  
  - Excalidraw plugin を最新版へ  
  - テーブルの要素が `group` されているか確認  
  - テーブルの要素を選択してから再実行

---

## License

MIT License

---

## Author

- GitHub: https://github.com/tk-pkm111

Issues / PR welcome 🙌
