/*
This script has two functions based on your selection:
1.  **Create a new table:** If you run this script without selecting any part of a table, it will open a dialog to create a new table. The table is constructed from individual lines, background cells, and empty text elements.
2.  **Update an existing table's layout:** After creating a table, you can manually drag any horizontal or vertical line to a new position. Then, select any part of that table and run this script again. It will automatically resize all the cells in the corresponding row or column and shift subsequent rows/columns to accommodate the change, without squishing other cells.

## How to use
**To create a table:**
1. Run this script from the command palette without a table element selected.
2. Fill in the dialog with your desired settings and click "Create Table".

**To resize a row or column:**
1. Manually drag any horizontal or vertical line of the table to its new position.
2. Select any element of the table (a line, a cell, or a text element).
3. Run this script again.
4. The layout of the table will be updated automatically.
*/

if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("1.8.21")) {
  new Notice("このスクリプトは、より新しいバージョンのExcalidrawが必要です。最新版をインストールしてください。");
  return;
}

const selectedElements = ea.getViewSelectedElements();
const tableId = (selectedElements.length > 0 && selectedElements[0].customData) ? selectedElements[0].customData.tableId : null;

if (tableId) {
  await updateTableLayout(tableId);
} else {
  await showCreateTableDialog();
}

async function updateTableLayout(tableId) {
  const allTableElements = ea.getViewElements().filter(el => el.customData && el.customData.tableId === tableId);
  if (allTableElements.length === 0) {
    new Notice("Could not find table elements.");
    return;
  }

  ea.copyViewElementsToEAforEditing(allTableElements);

  // Temporarily ungroup all elements to allow individual resizing
  ea.getElements().forEach(el => el.groupIds = []);

  const hLines = ea.getElements()
    .filter(el => el.customData && el.customData.type === 'row-divider')
    .sort((a, b) => a.y - b.y);

  const vLines = ea.getElements()
    .filter(el => el.customData && el.customData.type === 'col-divider')
    .sort((a, b) => a.x - b.x);

  const cells = ea.getElements().filter(el => el.customData && el.customData.type === 'cell');
  const texts = ea.getElements().filter(el => el.customData && el.customData.type === 'text');

  const rowHeights = [];
  for(let i = 0; i < hLines.length - 1; i++) {
    rowHeights.push(hLines[i+1].y - hLines[i].y);
  }

  const colWidths = [];
  for(let i = 0; i < vLines.length - 1; i++) {
    colWidths.push(vLines[i+1].x - vLines[i].x);
  }

  const originX = vLines[0].x;
  const originY = hLines[0].y;
  
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  const tableHeight = rowHeights.reduce((sum, height) => sum + height, 0);

  let currentX = originX;
  vLines.forEach((line, index) => {
    line.x = currentX;
    line.y = originY;
    line.points = [[0, 0], [0, tableHeight]];
    if(index < colWidths.length) {
      currentX += colWidths[index];
    }
  });

  let currentY = originY;
  hLines.forEach((line, index) => {
    line.y = currentY;
    line.x = originX;
    line.points = [[0, 0], [tableWidth, 0]];
    if(index < rowHeights.length) {
      currentY += rowHeights[index];
    }
  });
  
  currentY = originY;
  for (let i = 0; i < rowHeights.length; i++) {
    currentX = originX;
    for (let j = 0; j < colWidths.length; j++) {
      const cell = cells.find(c => c.customData.rowIndex === i && c.customData.colIndex === j);
      const text = texts.find(t => t.customData.rowIndex === i && t.customData.colIndex === j);
      
      if(cell) {
        cell.x = currentX;
        cell.y = currentY;
        cell.width = colWidths[j];
        cell.height = rowHeights[i];
      }
      
      if(text) {
        ea.style.fontSize = text.fontSize;
        ea.style.fontFamily = text.fontFamily;
        const textSize = ea.measureText(text.text);
        text.x = currentX + (colWidths[j] - textSize.width) / 2;
        text.y = currentY + (rowHeights[i] - textSize.height) / 2;
      }
      currentX += colWidths[j];
    }
    currentY += rowHeights[i];
  }

  // Re-group all elements together
  const allIds = ea.getElements().map(el => el.id);
  ea.addToGroup(allIds);

  await ea.addElementsToView(false);
  new Notice("テーブルのレイアウトを更新しました。");
}

async function showCreateTableDialog() {
  const colors = {
    "Light Red": "#ffc9c9",
    "Light Pink": "#fcc2d7",
    "Light Grape": "#eebefa",
    "Light Violet": "#d0bfff",
    "Light Indigo": "#bac8ff",
    "Light Blue": "#a5d8ff",
    "Light Cyan": "#99e9f2",
    "Light Teal": "#96f2d7",
    "Light Green": "#b2f2bb",
    "Light Lime": "#d8f5a2",
    "Light Yellow": "#ffec99",
    "Light Orange": "#ffd8a8",
    "Gray": "#ced4da",
    "Transparent": "transparent"
  };

  async function createTable(rows, cols, colHeaderColor, rowHeaderColor, cellWidth, cellHeight, outerBorderWidth, innerGridWidth) {
    ea.clear();

    ea.style.roughness = 0;
    ea.style.fillStyle = "solid";

    const tableId = ea.generateElementId();
    const allElementIds = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * cellWidth;
        const y = i * cellHeight;

        if (i === 0) {
          ea.style.backgroundColor = colHeaderColor;
        } else if (j === 0) {
          ea.style.backgroundColor = rowHeaderColor;
        } else {
          ea.style.backgroundColor = "#ffffff";
        }
        ea.style.strokeColor = "transparent";
        ea.style.strokeWidth = 1;
        const rectId = ea.addRect(x, y, cellWidth, cellHeight);
        ea.addAppendUpdateCustomData(rectId, { tableId: tableId, type: 'cell', rowIndex: i, colIndex: j });
        allElementIds.push(rectId);
        
        ea.style.strokeColor = "#000000";
        const textSize = ea.measureText("");
        const textX = x + (cellWidth - textSize.width) / 2;
        const textY = y + (cellHeight - textSize.height) / 2;
        const textId = ea.addText(textX, textY, "");
        ea.addAppendUpdateCustomData(textId, { tableId: tableId, type: 'text', rowIndex: i, colIndex: j });
        allElementIds.push(textId);
      }
    }
    
    ea.style.strokeColor = "#000000";
    ea.style.backgroundColor = "transparent";

    for (let i = 0; i <= rows; i++) {
      if (i === 0 || i === rows) {
        ea.style.strokeWidth = outerBorderWidth;
      } else {
        ea.style.strokeWidth = innerGridWidth;
      }
      const y = i * cellHeight;
      const lineId = ea.addLine([[0, y], [cols * cellWidth, y]]);
      ea.addAppendUpdateCustomData(lineId, { tableId: tableId, type: 'row-divider', rowIndex: i });
      allElementIds.push(lineId);
    }

    for (let j = 0; j <= cols; j++) {
      if (j === 0 || j === cols) {
        ea.style.strokeWidth = outerBorderWidth;
      } else {
        ea.style.strokeWidth = innerGridWidth;
      }
      const x = j * cellWidth;
      const lineId = ea.addLine([[x, 0], [x, rows * cellHeight]]);
      ea.addAppendUpdateCustomData(lineId, { tableId: tableId, type: 'col-divider', colIndex: j });
      allElementIds.push(lineId);
    }

    ea.addToGroup(allElementIds);

    await ea.addElementsToView(true);
    new Notice(`テーブルを作成しました。境界線を動かした後、テーブルのいずれかの部分を選択して再度このスクリプトを実行するとレイアウトが更新されます。`, 10000);
  }

  const modal = new ea.FloatingModal(ea.plugin.app);

  modal.onOpen = () => {
    const { contentEl } = modal;
    modal.titleEl.setText("テーブル作成ウィザード");

    let rows = 5;
    let cols = 5;
    let cellWidth = 150;
    let cellHeight = 40;
    let colHeaderColor = colors["Light Blue"];
    let rowHeaderColor = colors["Gray"];
    let outerBorderWidth = 2;
    let innerGridWidth = 1;

    new ea.obsidian.Setting(contentEl)
      .setName("行数")
      .addText(text => {
        text.setValue(String(rows))
          .onChange(value => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              rows = num;
            }
          });
      });

    new ea.obsidian.Setting(contentEl)
      .setName("列数")
      .addText(text => {
        text.setValue(String(cols))
          .onChange(value => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              cols = num;
            }
          });
      });

    new ea.obsidian.Setting(contentEl)
      .setName("セルの幅")
      .addText(text => {
        text.setValue(String(cellWidth))
          .onChange(value => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              cellWidth = num;
            }
          });
      });

    new ea.obsidian.Setting(contentEl)
      .setName("セルの高さ")
      .addText(text => {
        text.setValue(String(cellHeight))
          .onChange(value => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              cellHeight = num;
            }
          });
      });

    new ea.obsidian.Setting(contentEl)
      .setName("外枠の太さ")
      .addText(text => {
        text.setValue(String(outerBorderWidth))
          .onChange(value => {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 0) {
              outerBorderWidth = num;
            }
          });
      });
      
    new ea.obsidian.Setting(contentEl)
      .setName("内側の線の太さ")
      .addText(text => {
        text.setValue(String(innerGridWidth))
          .onChange(value => {
            const num = parseInt(value);
            if (!isNaN(num) && num >= 0) {
              innerGridWidth = num;
            }
          });
      });

    new ea.obsidian.Setting(contentEl)
      .setName("列ヘッダーの色")
      .addDropdown(dropdown => {
        for (const [name, value] of Object.entries(colors)) {
          dropdown.addOption(value, name);
        }
        dropdown.setValue(colHeaderColor)
          .onChange(value => {
            colHeaderColor = value;
          });
      });

    new ea.obsidian.Setting(contentEl)
      .setName("行ヘッダーの色")
      .addDropdown(dropdown => {
        for (const [name, value] of Object.entries(colors)) {
          dropdown.addOption(value, name);
        }
        dropdown.setValue(rowHeaderColor)
          .onChange(value => {
            rowHeaderColor = value;
          });
      });

    new ea.obsidian.Setting(contentEl)
      .addButton(btn => {
        btn.setButtonText("テーブルを作成")
          .setCta()
          .onClick(() => {
            modal.close();
            createTable(rows, cols, colHeaderColor, rowHeaderColor, cellWidth, cellHeight, outerBorderWidth, innerGridWidth);
          });
      });
  };

  modal.onClose = () => {};
  modal.open();
}
