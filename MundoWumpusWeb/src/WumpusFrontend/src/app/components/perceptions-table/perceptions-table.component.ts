import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerceptionCell, PerceptionSnapshot } from '../../models/game-models';

@Component({
  selector: 'app-perceptions-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <h3 class="section-title">📋 Tabla de Percepciones</h3>
      <div class="table-scroll">
        <table *ngIf="filteredCells.length > 0; else noData">
          <thead>
            <tr>
              <th>Celda</th>
              <th>Fila</th>
              <th>Col</th>
              <th>💨 Brisa</th>
              <th>👃 Hedor</th>
              <th>✨ Brillo</th>
              <th>👣 Visitada</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cell of filteredCells"
                [class.current-cell]="cell.row === agentRow && cell.col === agentCol"
                [class.breeze-row]="cell.hasBreeze"
                [class.stench-row]="cell.hasStench"
                [class.glitter-row]="cell.hasGlitter">
              <td class="cell-id">F{{ cell.row }}C{{ cell.col }}</td>
              <td>{{ cell.row }}</td>
              <td>{{ cell.col }}</td>
              <td>
                <span class="badge" [class.badge-true]="cell.hasBreeze" [class.badge-false]="!cell.hasBreeze">
                  {{ cell.hasBreeze ? 'SÍ' : 'NO' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-true]="cell.hasStench" [class.badge-false]="!cell.hasStench">
                  {{ cell.hasStench ? 'SÍ' : 'NO' }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-true]="cell.hasGlitter" [class.badge-false]="!cell.hasGlitter">
                  {{ cell.hasGlitter ? 'SÍ' : 'NO' }}
                </span>
              </td>
              <td>{{ cell.isVisited ? '✅' : '⬜' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noData>
          <p class="empty-msg">Sin percepciones registradas todavía.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .table-container {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-title {
      margin: 0 0 0.75rem 0;
      font-size: 1.1rem;
      color: #ddd;
    }

    .table-scroll {
      max-height: 250px;
      overflow-y: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
    }

    th {
      background: rgba(255, 255, 255, 0.06);
      padding: 0.5rem 0.4rem;
      text-align: center;
      font-weight: 600;
      color: #aaa;
      position: sticky;
      top: 0;
      font-size: 0.72rem;
    }

    td {
      padding: 0.35rem 0.4rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .cell-id { font-family: monospace; color: #ccc; }

    tr.current-cell {
      background: rgba(74, 144, 217, 0.2) !important;
      font-weight: 600;
    }

    tr.breeze-row { background: rgba(135, 206, 235, 0.08); }
    tr.stench-row { background: rgba(144, 238, 144, 0.06); }
    tr.glitter-row { background: rgba(255, 215, 0, 0.1); }

    .badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .badge-true { background: rgba(68, 204, 68, 0.2); color: #44cc44; }
    .badge-false { background: rgba(255, 255, 255, 0.05); color: #666; }

    .empty-msg {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 1rem;
    }

    .table-scroll::-webkit-scrollbar { width: 4px; }
    .table-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  `]
})
export class PerceptionsTableComponent implements OnChanges {
  @Input() perceptions: PerceptionSnapshot | undefined;
  @Input() agentRow: number | undefined;
  @Input() agentCol: number | undefined;

  filteredCells: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.perceptions?.cells) {
      this.filteredCells = this.perceptions.cells
        .filter((c: PerceptionCell) => c.hasBreeze || c.hasStench || c.hasGlitter || c.isVisited)
        .sort((a: PerceptionCell, b: PerceptionCell) => a.row - b.row || a.col - b.col);
    } else {
      this.filteredCells = [];
    }
  }
}
