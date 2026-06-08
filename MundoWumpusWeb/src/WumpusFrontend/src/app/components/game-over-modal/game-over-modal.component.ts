import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-over-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()" [ngClass]="modalClass">
        <div class="modal-icon">{{ icon }}</div>
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>

        <div class="modal-stats">
          <div class="modal-stat">
            <span class="stat-num">{{ totalTurns }}</span>
            <span class="stat-lbl">Turnos</span>
          </div>
          <div class="modal-stat">
            <span class="stat-num">{{ totalActions }}</span>
            <span class="stat-lbl">Acciones</span>
          </div>
          <div class="modal-stat">
            <span class="stat-num">{{ hasGold ? '💰' : '❌' }}</span>
            <span class="stat-lbl">Oro</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-restart" (click)="restart.emit()">
            🔄 Nueva Partida
          </button>
          <button class="btn-close" (click)="close.emit()">
            ✕ Cerrar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      background: #1a1a2e;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 2.5rem;
      text-align: center;
      max-width: 420px;
      width: 90%;
      animation: slideUp 0.4s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-card.won { border-color: rgba(240, 192, 64, 0.4); box-shadow: 0 0 30px rgba(240, 192, 64, 0.2); }
    .modal-card.died { border-color: rgba(255, 68, 68, 0.4); box-shadow: 0 0 30px rgba(255, 68, 68, 0.2); }
    .modal-card.surrendered { border-color: rgba(255, 255, 255, 0.2); }

    .modal-icon {
      font-size: 4rem;
      margin-bottom: 0.5rem;
    }

    .modal-title {
      font-size: 1.8rem;
      margin: 0 0 0.5rem 0;
    }

    .won .modal-title { color: #f0c040; }
    .died .modal-title { color: #ff4444; }

    .modal-message {
      color: #aaa;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .modal-stats {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .modal-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f0c040;
    }

    .stat-lbl {
      font-size: 0.7rem;
      color: #888;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }

    .btn-restart {
      padding: 0.7rem 2rem;
      background: linear-gradient(135deg, #ff6b35, #f0c040);
      border: none;
      border-radius: 10px;
      color: #1a1a2e;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-restart:hover { transform: scale(1.05); }

    .btn-close {
      padding: 0.7rem 1.5rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      color: #ccc;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-close:hover { background: rgba(255,255,255,0.12); }
  `]
})
export class GameOverModalComponent implements OnChanges {
  @Input() status = '';
  @Input() totalTurns = 0;
  @Input() totalActions = 0;
  @Input() hasGold = false;

  @Output() restart = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  icon = '';
  title = '';
  message = '';
  modalClass = '';

  ngOnChanges(changes: SimpleChanges): void {
    switch (this.status) {
      case 'Won':
        this.icon = '🏆';
        this.title = '¡Victoria!';
        this.message = '¡Encontraste el oro y regresaste sano al inicio! Has dominado el Mundo de Wumpus.';
        this.modalClass = 'won';
        break;
      case 'DiedPit':
        this.icon = '🕳️';
        this.title = '¡Caíste en un pozo!';
        this.message = 'El agente cayó en un pozo sin fondo. La exploración terminó trágicamente.';
        this.modalClass = 'died';
        break;
      case 'DiedWumpus':
        this.icon = '🦇';
        this.title = '¡El Wumpus te devoró!';
        this.message = 'El Wumpus acecha en las sombras del laberinto... y te encontró.';
        this.modalClass = 'died';
        break;
      case 'Surrendered':
        this.icon = '🏳️';
        this.title = 'Te has rendido';
        this.message = 'Decidiste abandonar la exploración. El mundo de Wumpus sigue siendo un misterio.';
        this.modalClass = 'surrendered';
        break;
    }
  }
}
