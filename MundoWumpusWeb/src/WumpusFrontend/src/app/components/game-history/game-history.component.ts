import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogService } from '../../services/log.service';
import { GameLogDto } from '../../models/game-models';

@Component({
  selector: 'app-game-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="history-page">
      <div class="history-container">
        <a routerLink="/" class="back-link">← Volver al juego</a>
        <h2>📜 Historial de Partidas</h2>

        <div class="game-cards" *ngIf="games.length > 0; else empty">
          <div class="game-card" *ngFor="let game of games" [class.won]="game.status === 'Won'"
               [class.lost]="game.status !== 'Won' && game.status !== 'InProgress'"
               [class.active]="game.status === 'InProgress'">
            <div class="card-header">
              <span class="card-status">{{ statusEmoji(game.status) }} {{ game.status }}</span>
              <span class="card-date">{{ game.startedAt | date:'medium' }}</span>
            </div>

            <div class="card-stats">
              <div class="card-stat">
                <span class="cs-value">{{ game.totalTurns }}</span>
                <span class="cs-label">Turnos</span>
              </div>
              <div class="card-stat">
                <span class="cs-value">{{ game.totalActions }}</span>
                <span class="cs-label">Acciones</span>
              </div>
              <div class="card-stat">
                <span class="cs-value">{{ game.durationSeconds | number:'1.1-1' }}s</span>
                <span class="cs-label">Duración</span>
              </div>
              <div class="card-stat">
                <span class="cs-value">{{ game.score }}</span>
                <span class="cs-label">Puntaje</span>
              </div>
              <div class="card-stat">
                <span class="cs-value">{{ game.agentHasGold ? '💰' : '❌' }}</span>
                <span class="cs-label">Oro</span>
              </div>
            </div>

            <div class="card-position">
              Posición final: <strong>F{{ game.agentFinalRow }} C{{ game.agentFinalCol }}</strong>
            </div>

            <!-- Lista de acciones compacta -->
            <details class="card-actions">
              <summary>📝 {{ game.actions.length }} acciones registradas</summary>
              <div class="action-list">
                <div class="action-item" *ngFor="let a of game.actions.slice(-15)">
                  <span class="ai-turn">#{{ a.turnNumber }}</span>
                  <span class="ai-desc">{{ a.description }}</span>
                </div>
                <p class="ai-more" *ngIf="game.actions.length > 15">
                  ... y {{ game.actions.length - 15 }} acciones más
                </p>
              </div>
            </details>
          </div>
        </div>

        <ng-template #empty>
          <p class="empty-msg">No hay partidas registradas todavía.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .history-page {
      min-height: calc(100vh - 80px);
      padding: 2rem;
    }

    .history-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .back-link {
      color: #f0c040;
      text-decoration: none;
      font-size: 0.9rem;
      display: inline-block;
      margin-bottom: 1rem;
    }

    h2 {
      text-align: center;
      color: #f0c040;
      margin-bottom: 1.5rem;
    }

    .game-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .game-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      transition: border-color 0.2s;
    }

    .game-card.won { border-left: 3px solid #44cc44; }
    .game-card.lost { border-left: 3px solid #ff4444; }
    .game-card.active { border-left: 3px solid #4a90d9; }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .card-status { font-weight: 700; font-size: 1.1rem; }
    .card-date { color: #888; font-size: 0.8rem; }

    .card-stats {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .card-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .cs-value { font-size: 1.1rem; font-weight: 600; color: #f0c040; }
    .cs-label { font-size: 0.7rem; color: #888; }

    .card-position {
      color: #aaa;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .card-actions {
      margin-top: 0.5rem;
    }

    .card-actions summary {
      color: #aaa;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .action-list {
      margin-top: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .action-item {
      padding: 0.2rem 0;
      font-size: 0.78rem;
      color: #999;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }

    .ai-turn {
      color: #666;
      margin-right: 0.5rem;
      font-family: monospace;
    }

    .ai-more {
      color: #666;
      font-style: italic;
      font-size: 0.8rem;
    }

    .empty-msg {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class GameHistoryComponent implements OnInit {
  games: GameLogDto[] = [];

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.logService.getAllGames().subscribe({
      next: (data) => this.games = data,
      error: () => this.games = []
    });
  }

  statusEmoji(status: string): string {
    const map: Record<string, string> = {
      'Won': '🏆',
      'DiedPit': '🕳️',
      'DiedWumpus': '🦇',
      'Surrendered': '🏳️',
      'InProgress': '▶️'
    };
    return map[status] ?? '❓';
  }
}
