import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">
      <h3 class="section-title">📊 Estadísticas en Tiempo Real</h3>

      <!-- Métricas principales -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">{{ statusText }}</div>
          <div class="metric-label">Estado</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ totalTurns }}</div>
          <div class="metric-label">Turnos</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ totalActions }}</div>
          <div class="metric-label">Acciones</div>
        </div>
        <div class="metric-card" [class.has-gold]="agentHasGold">
          <div class="metric-value">{{ agentHasGold ? '💰 SÍ' : '❌ NO' }}</div>
          <div class="metric-label">Tiene Oro</div>
        </div>
      </div>

      <!-- Barra de progreso: % celdas visitadas -->
      <div class="stat-bar">
        <div class="stat-bar-header">
          <span>🗺️ Celdas Visitadas</span>
          <span>{{ visitedPercentage | number:'1.0-0' }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill visited-fill"
            [style.width.%]="visitedPercentage"
          ></div>
        </div>
      </div>

      <!-- Barra de progreso: nivel de peligro -->
      <div class="stat-bar">
        <div class="stat-bar-header">
          <span>⚠️ Nivel de Peligro</span>
          <span [class.danger-high]="dangerLevel > 70"
                [class.danger-med]="dangerLevel > 30 && dangerLevel <= 70"
                [class.danger-low]="dangerLevel <= 30">
            {{ dangerLevel }}%
          </span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill danger-fill"
            [style.width.%]="dangerLevel"
            [class.bg-danger-high]="dangerLevel > 70"
            [class.bg-danger-med]="dangerLevel > 30 && dangerLevel <= 70"
            [class.bg-danger-low]="dangerLevel <= 30"
          ></div>
        </div>
      </div>

      <!-- Mini gauge circular: Peligro -->
      <div class="gauge-container">
        <svg viewBox="0 0 120 120" class="gauge-svg">
          <circle cx="60" cy="60" r="50"
            stroke="rgba(255,255,255,0.1)" stroke-width="10" fill="none" />
          <circle cx="60" cy="60" r="50"
            [attr.stroke]="gaugeColor"
            stroke-width="10" fill="none"
            stroke-linecap="round"
            [attr.stroke-dasharray]="gaugeDashArray"
            [attr.stroke-dashoffset]="gaugeDashOffset"
            transform="rotate(-90 60 60)" />
          <text x="60" y="55" text-anchor="middle" class="gauge-value">
            {{ dangerLevel }}%
          </text>
          <text x="60" y="75" text-anchor="middle" class="gauge-label">
            Peligro
          </text>
        </svg>
      </div>

      <!-- Indicador según percepciones -->
      <div class="perception-indicators">
        <div class="perception-ind" *ngIf="hasGoldStatus">
          🏆 <strong>¡Oro en posesión!</strong> Regresa al inicio (F9 C0).
        </div>
        <div class="perception-ind" *ngIf="gameStatus === 'Won'">
          🎉 <strong>¡Victoria!</strong>
        </div>
        <div class="perception-ind danger" *ngIf="gameStatus === 'DiedPit'">
          💀 <strong>Caíste en un pozo</strong>
        </div>
        <div class="perception-ind danger" *ngIf="gameStatus === 'DiedWumpus'">
          🦇 <strong>El Wumpus te devoró</strong>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
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

    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.6rem;
      text-align: center;
    }

    .metric-card.has-gold {
      border: 1px solid rgba(240, 192, 64, 0.3);
    }

    .metric-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #f0c040;
    }

    .metric-label {
      font-size: 0.7rem;
      color: #888;
      margin-top: 2px;
    }

    .stat-bar {
      margin-bottom: 0.8rem;
    }

    .stat-bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #aaa;
      margin-bottom: 4px;
    }

    .danger-high { color: #ff4444 !important; font-weight: 700; }
    .danger-med { color: #ffa500 !important; }
    .danger-low { color: #44cc44 !important; }

    .progress-bar {
      height: 10px;
      background: rgba(255,255,255,0.08);
      border-radius: 5px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 5px;
      transition: width 0.5s ease;
    }

    .visited-fill {
      background: linear-gradient(90deg, #4a90d9, #6db3f2);
    }

    .danger-fill {
      transition: width 0.5s ease, background 0.5s ease;
    }

    .bg-danger-high { background: linear-gradient(90deg, #ff4444, #ff6666); }
    .bg-danger-med { background: linear-gradient(90deg, #ff8c00, #ffa500); }
    .bg-danger-low { background: linear-gradient(90deg, #44aa44, #66cc66); }

    .gauge-container {
      display: flex;
      justify-content: center;
      margin: 0.5rem 0;
    }

    .gauge-svg {
      width: 100px;
      height: 100px;
    }

    .gauge-value {
      font-size: 1.2rem;
      font-weight: 700;
      fill: #f0c040;
    }

    .gauge-label {
      font-size: 0.6rem;
      fill: #888;
    }

    .perception-indicators {
      margin-top: 0.75rem;
    }

    .perception-ind {
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      margin-bottom: 4px;
      background: rgba(255,255,255,0.05);
    }

    .perception-ind.danger {
      background: rgba(255, 68, 68, 0.15);
      color: #ff6666;
    }
  `]
})
export class StatsPanelComponent implements OnChanges {
  @Input() visitedPercentage = 0;
  @Input() dangerLevel = 0;
  @Input() totalTurns = 0;
  @Input() totalActions = 0;
  @Input() agentHasGold = false;
  @Input() gameStatus = '';

  gaugeDashArray = 2 * Math.PI * 50; // ~314.16
  gaugeDashOffset = this.gaugeDashArray;
  gaugeColor = '#44cc44';

  get statusText(): string {
    const map: Record<string, string> = {
      'InProgress': '▶️ En juego',
      'Won': '🏆 Victoria',
      'DiedPit': '💀 Muerto',
      'DiedWumpus': '🦇 Devorado',
      'Surrendered': '🏳️ Rendido'
    };
    return map[this.gameStatus] ?? this.gameStatus;
  }

  get hasGoldStatus(): boolean {
    return this.agentHasGold && this.gameStatus === 'InProgress';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dangerLevel']) {
      this.updateGauge();
    }
  }

  private updateGauge(): void {
    const ratio = this.dangerLevel / 100;
    this.gaugeDashOffset = this.gaugeDashArray * (1 - ratio);

    if (this.dangerLevel > 70) this.gaugeColor = '#ff4444';
    else if (this.dangerLevel > 30) this.gaugeColor = '#ffa500';
    else this.gaugeColor = '#44cc44';
  }
}
