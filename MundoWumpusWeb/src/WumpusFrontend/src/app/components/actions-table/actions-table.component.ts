import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionDto } from '../../models/game-models';

@Component({
  selector: 'app-actions-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <h3 class="section-title">📝 Tabla de Acciones ({{ actions.length }} total)</h3>
      <div class="table-scroll" #scrollContainer>
        <table *ngIf="actions.length > 0; else noData">
          <thead>
            <tr>
              <th>#</th>
              <th>Acción</th>
              <th>Descripción</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let action of displayedActions; let i = index"
                [class.action-move]="action.action === 'MOVE'"
                [class.action-grab]="action.action === 'GRAB'"
                [class.action-start]="action.action === 'START'"
                [class.action-surrender]="action.action === 'SURRENDER'"
                [class.action-invalid]="action.action === 'MOVE_INVALID'">
              <td class="action-num">{{ action.turnNumber || '0' }}</td>
              <td>
                <span class="action-badge" [ngClass]="getActionClass(action.action)">
                  {{ action.action }}
                </span>
              </td>
              <td class="action-desc">{{ action.description }}</td>
              <td class="action-time">{{ action.timestamp | date:'HH:mm:ss' }}</td>
            </tr>
          </tbody>
        </table>
        <ng-template #noData>
          <p class="empty-msg">Sin acciones registradas.</p>
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
      flex: 1;
    }

    .section-title {
      margin: 0 0 0.75rem 0;
      font-size: 1.1rem;
      color: #ddd;
    }

    .table-scroll {
      max-height: 300px;
      overflow-y: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.78rem;
    }

    th {
      background: rgba(255, 255, 255, 0.06);
      padding: 0.45rem 0.3rem;
      text-align: left;
      font-weight: 600;
      color: #aaa;
      position: sticky;
      top: 0;
      font-size: 0.7rem;
    }

    td {
      padding: 0.3rem 0.3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #bbb;
    }

    .action-num {
      width: 30px;
      text-align: center;
      color: #888;
      font-family: monospace;
    }

    .action-desc {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-time {
      width: 70px;
      font-family: monospace;
      font-size: 0.7rem;
      color: #666;
    }

    .action-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .badge-move { background: rgba(74, 144, 217, 0.2); color: #6db3f2; }
    .badge-grab { background: rgba(240, 192, 64, 0.2); color: #f0c040; }
    .badge-start { background: rgba(68, 204, 68, 0.2); color: #44cc44; }
    .badge-surrender { background: rgba(255, 68, 68, 0.2); color: #ff6666; }
    .badge-invalid { background: rgba(255, 136, 0, 0.2); color: #ff8800; }
    .badge-default { background: rgba(255,255,255,0.05); color: #888; }

    tr.action-move { background: rgba(74, 144, 217, 0.04); }
    tr.action-grab { background: rgba(240, 192, 64, 0.06); border-left: 2px solid #f0c040; }
    tr.action-start { background: rgba(68, 204, 68, 0.04); }
    tr.action-surrender { background: rgba(255, 68, 68, 0.04); }
    tr.action-invalid { background: rgba(255, 136, 0, 0.04); }

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
export class ActionsTableComponent implements OnChanges {
  @Input() actions: ActionDto[] = [];

  displayedActions: ActionDto[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Mostrar últimas 20 acciones
    const allActions = this.actions || [];
    const start = Math.max(0, allActions.length - 20);
    this.displayedActions = allActions.slice(start);
  }

  getActionClass(action: string): string {
    const map: Record<string, string> = {
      'MOVE': 'badge-move',
      'GRAB': 'badge-grab',
      'START': 'badge-start',
      'SURRENDER': 'badge-surrender',
      'MOVE_INVALID': 'badge-invalid',
      'GRAB_IGNORED': 'badge-invalid'
    };
    return map[action] ?? 'badge-default';
  }
}
