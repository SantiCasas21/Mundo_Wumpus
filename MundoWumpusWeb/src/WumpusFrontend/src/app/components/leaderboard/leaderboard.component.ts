import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogService } from '../../services/log.service';
import { LeaderboardEntryDto } from '../../models/game-models';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="leaderboard-page">
      <div class="lb-container">
        <a routerLink="/" class="back-link">← Volver al juego</a>
        <h2>🏆 Leaderboard — Mejores Partidas</h2>

        <div class="lb-table" *ngIf="entries.length > 0; else empty">
          <div class="lb-row lb-header">
            <span class="lb-rank">#</span>
            <span class="lb-score">Puntaje</span>
            <span class="lb-turns">Turnos</span>
            <span class="lb-time">Duración</span>
            <span class="lb-date">Fecha</span>
          </div>
          <div class="lb-row" *ngFor="let entry of entries; let i = index"
               [class.top1]="i === 0" [class.top2]="i === 1" [class.top3]="i === 2">
            <span class="lb-rank">{{ getRankIcon(i) }}</span>
            <span class="lb-score">{{ entry.score }}</span>
            <span class="lb-turns">{{ entry.totalTurns }}</span>
            <span class="lb-time">{{ entry.durationSeconds | number:'1.1-1' }}s</span>
            <span class="lb-date">{{ entry.endedAt | date:'short' }}</span>
          </div>
        </div>

        <ng-template #empty>
          <p class="empty-msg">Aún no hay partidas ganadas. ¡Sé el primero!</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-page {
      min-height: calc(100vh - 80px);
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .lb-container {
      width: 100%;
      max-width: 700px;
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

    .lb-table {
      background: rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .lb-row {
      display: grid;
      grid-template-columns: 60px 1fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 0.9rem;
    }

    .lb-header {
      color: #888;
      font-weight: 600;
      font-size: 0.8rem;
      background: rgba(255,255,255,0.03);
    }

    .lb-rank { font-weight: 700; font-size: 1.2rem; }
    .lb-score { color: #f0c040; font-weight: 600; }
    .lb-turns { color: #ccc; }
    .lb-time { color: #aaa; font-family: monospace; }
    .lb-date { color: #888; font-size: 0.8rem; }

    .top1 { background: rgba(240, 192, 64, 0.1); }
    .top2 { background: rgba(192, 192, 192, 0.06); }
    .top3 { background: rgba(205, 127, 50, 0.06); }

    .empty-msg {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  entries: LeaderboardEntryDto[] = [];

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.logService.getLeaderboard(10).subscribe({
      next: (data) => this.entries = data,
      error: () => this.entries = []
    });
  }

  getRankIcon(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  }
}
