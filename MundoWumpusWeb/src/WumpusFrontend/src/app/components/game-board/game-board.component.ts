import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="board-container">
      <h3 class="section-title">🗺️ Mapa del Mundo de Wumpus</h3>

      <div class="board-grid">
        <!-- Encabezado de columnas -->
        <div class="header-corner"></div>
        <div class="col-header" *ngFor="let col of cols; let i = index">C{{ i }}</div>

        <ng-container *ngFor="let row of rows; let r = index">
          <!-- Etiqueta de fila -->
          <div class="row-label" [class.start-row]="r === 9">F{{ r }}</div>

          <!-- Celdas -->
          <div
            *ngFor="let col of rows; let c = index"
            class="cell"
            [class.agent-cell]="isAgentCell(r, c)"
            [class.visited-cell]="isVisited(r, c) && !isAgentCell(r, c)"
            [class.breeze-cell]="hasBreeze(r, c) && isVisited(r, c) && !isAgentCell(r, c)"
            [class.stench-cell]="hasStench(r, c) && isVisited(r, c) && !isAgentCell(r, c)"
            [class.glitter-cell]="hasGlitter(r, c) && isVisited(r, c) && !isAgentCell(r, c)"
            [class.perception-cell]="(hasBreeze(r, c) || hasStench(r, c) || hasGlitter(r, c)) && isVisited(r, c)"
            [attr.title]="getCellTooltip(r, c)"
          >
            <span class="cell-agent" *ngIf="isAgentCell(r, c)">🧑</span>
            <span class="cell-breeze" *ngIf="hasBreeze(r, c) && isVisited(r, c) && !isAgentCell(r, c)" title="Brisa">💨</span>
            <span class="cell-stench" *ngIf="hasStench(r, c) && isVisited(r, c) && !isAgentCell(r, c)" title="Hedor">👃</span>
            <span class="cell-glitter" *ngIf="hasGlitter(r, c) && isVisited(r, c) && !isAgentCell(r, c)" title="Brillo">✨</span>
          </div>
        </ng-container>
      </div>

      <!-- Leyenda -->
      <div class="legend">
        <span><span class="legend-dot agent-dot"></span> Agente</span>
        <span><span class="legend-dot visited-dot"></span> Visitado</span>
        <span>💨 Brisa (pozo adyacente)</span>
        <span>👃 Hedor (Wumpus adyacente)</span>
        <span>✨ Brillo (oro aquí)</span>
      </div>
    </div>
  `,
  styles: [`
    .board-container {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-title {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      color: #ddd;
    }

    .board-grid {
      display: grid;
      grid-template-columns: 40px repeat(10, 1fr);
      gap: 2px;
      max-width: 600px;
      margin: 0 auto;
    }

    .header-corner {
      height: 28px;
    }

    .col-header {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #888;
      font-weight: 600;
      height: 28px;
    }

    .row-label {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #888;
      font-weight: 600;
      min-height: 48px;
    }

    .row-label.start-row {
      color: #f0c040;
      font-weight: 700;
    }

    .cell {
      aspect-ratio: 1;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      position: relative;
      min-width: 40px;
      min-height: 40px;
      transition: all 0.2s;
      cursor: default;
    }

    .cell.agent-cell {
      background: linear-gradient(135deg, #4a90d9, #357abd);
      border-color: #6db3f2;
      box-shadow: 0 0 12px rgba(74, 144, 217, 0.5);
      animation: agent-pulse 2s infinite;
      z-index: 2;
    }

    @keyframes agent-pulse {
      0%, 100% { box-shadow: 0 0 8px rgba(74, 144, 217, 0.4); }
      50% { box-shadow: 0 0 18px rgba(74, 144, 217, 0.7); }
    }

    .cell.visited-cell {
      background: rgba(255, 255, 255, 0.08);
    }

    .cell.breeze-cell {
      background: rgba(135, 206, 235, 0.15);
    }

    .cell.stench-cell {
      background: rgba(144, 238, 144, 0.12);
    }

    .cell.glitter-cell {
      background: rgba(255, 215, 0, 0.2);
    }

    .cell-agent {
      font-size: 1.4rem;
    }

    .cell-breeze, .cell-stench, .cell-glitter {
      position: absolute;
      font-size: 0.7rem;
      opacity: 0.8;
    }

    .cell-breeze { top: 1px; left: 2px; }
    .cell-stench { top: 1px; right: 2px; }
    .cell-glitter { bottom: 1px; left: 50%; transform: translateX(-50%); font-size: 0.85rem; }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1.2rem;
      margin-top: 1rem;
      font-size: 0.8rem;
      color: #aaa;
      justify-content: center;
    }

    .legend-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 3px;
      vertical-align: middle;
      margin-right: 4px;
    }

    .agent-dot { background: #4a90d9; }
    .visited-dot { background: rgba(255,255,255,0.3); }
  `]
})
export class GameBoardComponent implements OnChanges {
  @Input() board: string[][] = [];
  @Input() agentRow: number | undefined;
  @Input() agentCol: number | undefined;
  @Input() visitedCells: Set<string> = new Set();

  rows = Array.from({ length: 10 }, (_, i) => i);
  cols = Array.from({ length: 10 }, (_, i) => i);

  ngOnChanges(changes: SimpleChanges): void {
    // Reactivo a cambios en los inputs
  }

  isAgentCell(row: number, col: number): boolean {
    return row === this.agentRow && col === this.agentCol;
  }

  isVisited(row: number, col: number): boolean {
    return this.visitedCells.has(`${row},${col}`);
  }

  hasBreeze(row: number, col: number): boolean {
    return this.isNeighborOf(row, col, 'P');
  }

  hasStench(row: number, col: number): boolean {
    return this.isNeighborOf(row, col, 'W');
  }

  hasGlitter(row: number, col: number): boolean {
    if (!this.board || row >= this.board.length) return false;
    const cellRow = this.board[row];
    if (!cellRow || col >= cellRow.length) return false;
    return cellRow[col] === 'O';
  }

  getCellTooltip(row: number, col: number): string {
    const parts: string[] = [`F${row} C${col}`];
    if (this.isAgentCell(row, col)) parts.push('🧑 Agente');
    if (this.hasBreeze(row, col)) parts.push('💨 Brisa');
    if (this.hasStench(row, col)) parts.push('👃 Hedor');
    if (this.hasGlitter(row, col)) parts.push('✨ Brillo');
    return parts.join(' | ');
  }

  private isNeighborOf(row: number, col: number, target: string): boolean {
    if (!this.board) return false;
    const neighbors = [
      [row - 1, col], [row + 1, col],
      [row, col - 1], [row, col + 1]
    ];
    return neighbors.some(([r, c]) =>
      r >= 0 && r < this.board.length &&
      c >= 0 && c < (this.board[0]?.length ?? 0) &&
      this.board[r][c] === target
    );
  }
}
