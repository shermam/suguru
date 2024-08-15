class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.clear();
  }

  putInRegion(region) {
    this.region = region;
  }

  clear() {
    this.divElement = document.createElement("div");
    this.divElement.classList.add("cell");
    this.region = null;
  }

  update() {
    // TODO: remove
    this.divElement.innerHTML = this.region.number;
    this.divElement.style.backgroundColor = this.region.color;
  }
}

class Region {
  constructor(size) {
    this.cells = [];
    this.size = size;
  }

  addCell(cell) {
    this.cells.push(cell);
    cell.putInRegion(this);
  }

  lastCell() {
    return this.cells[this.cells.length - 1];
  }

  clear() {
    this.cells.forEach((cell) => cell.clear());
  }
}

export class Game {
  constructor(divElement, size = 5, maxRegionSize = 5) {
    this.divElement = divElement;
    this.board = [];
    this.regions = [];
    for (let i = 0; i < size; i++) {
      this.board[i] = [];
      for (let j = 0; j < size; j++) {
        this.board[i][j] = new Cell(i, j);
      }
    }

    let cellsInRegions = 0;
    let nextAvailableCell = this.board[0][0];
    const cellTotal = size * size;
    while (cellsInRegions < cellTotal && nextAvailableCell) {
      let createdRegion = false;
      let regionSize = random(
        1,
        Math.min(cellTotal - cellsInRegions, maxRegionSize)
      );
      let region;
      while (!createdRegion) {
        region = new Region(regionSize);
        region.addCell(nextAvailableCell);
        for (let i = 1; i < regionSize; i++) {
          const cell = randomOrtogonalCell(region.lastCell(), this.board);
          if (cell == null) {
            // fail region creation
            createdRegion = false;
            region.clear();
            regionSize--;
            region = 0;
            break;
          }
          createdRegion = true;
          region.addCell(cell);
        }
        if (region?.cells?.length == regionSize) {
          createdRegion = true;
        }
      }
      if (!region) {
        // failed to create board
        console.error("failed board creation");
        console.log(this);
        break;
      }
      region.number = this.regions.push(region);
      nextAvailableCell = getNextAvailableCell(this.board);
    }

    // assign colors to regions
    for (let i = 0; i < this.regions.length; i++) {
      const region = this.regions[i];
      region.color =
        "#" +
        Math.floor((2 ** 24 / this.regions.length) * i)
          .toString(16)
          .padStart(6, "0");
    }

    // Builds html
    for (let i = 0; i < size; i++) {
      const col = document.createElement("div");
      col.classList.add("column");
      this.divElement.appendChild(col);
      for (let j = 0; j < size; j++) {
        const cell = this.board[i][j];
        cell.update();
        col.appendChild(cell.divElement);
      }
    }
  }
}

function getNextAvailableCell(board) {
  for (let i = 0; i < board.length; i++) {
    const cols = board[i];
    for (let j = 0; j < cols.length; j++) {
      const cell = cols[j];
      if (!cell.region) return cell;
    }
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomOrtogonalCell(cell, board) {
  return randomItem(
    [
      board[cell.x]?.[cell.y - 1],
      board[cell.x + 1]?.[cell.y],
      board[cell.x]?.[cell.y + 1],
      board[cell.x - 1]?.[cell.y],
    ]
      .filter(Boolean)
      .filter((c) => c.region == null)
  );
}
