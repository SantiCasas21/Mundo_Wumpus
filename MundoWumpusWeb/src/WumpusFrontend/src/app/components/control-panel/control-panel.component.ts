import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="controls-container">
      <h3 class="section-title">🎮 Controles</h3>

      <!-- D-Pad de movimiento -->
      <div class="dpad">
        <button class="dpad-btn up" (click)="move.emit('North')" [disabled]="!gameActive" title="W - Norte">
          ⬆️
        </button>
        <button class="dpad-btn left" (click)="move.emit('West')" [disabled]="!gameActive" title="A - Oeste">
          ⬅️
        </button>
        <div class="dpad-center">
          <span class="key-hint">WASD</span>
        </div>
        <button class="dpad-btn right" (click)="move.emit('East')" [disabled]="!gameActive" title="D - Este">
          ➡️
        </button>
        <button class="dpad-btn down" (click)="move.emit('South')" [disabled]="!gameActive" title="S - Sur">
          ⬇️
        </button>
      </div>

      <!-- Botones de acción -->
      <div class="action-buttons">
        <button
          class="action-btn grab-btn"
          (click)="grab.emit()"
          [disabled]="!gameActive"
          [class.pulse]="gameActive && !hasGold"
          title="T - Recoger oro"
        >
          💰 Recoger Oro <span class="key-tag">T</span>
        </button>

        <button
          class="action-btn surrender-btn"
          (click)="confirmSurrender()"
          [disabled]="!gameActive"
          title="Rendirse"
        >
          🏳️ Rendirse <span class="key-tag">Q</span>
        </button>
      </div>

      <!-- Confirmación de rendición -->
      <div class="surrender-confirm" *ngIf="showConfirm">
        <p>¿Estás seguro de que quieres rendirte?</p>
        <div class="confirm-buttons">
          <button class="confirm-btn yes" (click)="doSurrender()">Sí, rendirse</button>
          <button class="confirm-btn no" (click)="showConfirm = false">Cancelar</button>
        </div>
      </div>

      <!-- Atajos de teclado -->
      <div class="shortcuts">
        <span class="shortcut-label">Atajos:</span>
        <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> = Mover &nbsp;|&nbsp;
        <kbd>T</kbd> = Recoger Oro
      </div>

      <!-- Indicador de estado -->
      <div class="status-bar" *ngIf="hasGold">
        ⚠️ ¡Llevas el ORO! Regresa a <strong>F9 C0</strong> para ganar.
      </div>
    </div>
  `,
  styles: [`
    .controls-container {
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

    .dpad {
      display: grid;
      grid-template-columns: 70px 70px 70px;
      grid-template-rows: 70px 70px 70px;
      justify-content: center;
      gap: 6px;
      margin-bottom: 1.5rem;
    }

    .dpad-btn {
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dpad-btn:hover:not(:disabled) {
      background: rgba(240, 192, 64, 0.2);
      border-color: #f0c040;
      transform: scale(1.05);
    }

    .dpad-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .dpad-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .dpad-btn.up { grid-column: 2; grid-row: 1; }
    .dpad-btn.left { grid-column: 1; grid-row: 2; }
    .dpad-btn.right { grid-column: 3; grid-row: 2; }
    .dpad-btn.down { grid-column: 2; grid-row: 3; }

    .dpad-center {
      grid-column: 2; grid-row: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .key-hint {
      font-size: 0.8rem;
      color: #666;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .action-btn {
      padding: 0.7rem 1.2rem;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .grab-btn {
      background: linear-gradient(135deg, #f0c040, #ff8c00);
      color: #1a1a2e;
    }

    .grab-btn.pulse {
      animation: grab-pulse 1.5s infinite;
    }

    @keyframes grab-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(240, 192, 64, 0.5); }
      50% { box-shadow: 0 0 0 12px rgba(240, 192, 64, 0); }
    }

    .surrender-btn {
      background: rgba(255, 255, 255, 0.08);
      color: #ccc;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .surrender-btn:hover:not(:disabled) {
      background: rgba(255, 68, 68, 0.2);
      border-color: #ff4444;
      color: #ff6666;
    }

    .key-tag {
      font-size: 0.7rem;
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 4px;
    }

    .surrender-confirm {
      background: rgba(255, 68, 68, 0.1);
      border: 1px solid rgba(255, 68, 68, 0.3);
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    .surrender-confirm p { margin: 0 0 0.5rem 0; font-size: 0.9rem; }

    .confirm-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .confirm-btn {
      padding: 0.4rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 600;
    }

    .confirm-btn.yes { background: #cc3333; color: #fff; }
    .confirm-btn.no { background: rgba(255,255,255,0.1); color: #ccc; }

    .shortcuts {
      text-align: center;
      font-size: 0.8rem;
      color: #777;
    }

    .shortcut-label { color: #888; }
    kbd {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 0.75rem;
      font-family: monospace;
    }

    .status-bar {
      background: rgba(240, 192, 64, 0.15);
      border: 1px solid rgba(240, 192, 64, 0.3);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
      color: #f0c040;
    }
  `]
})
export class ControlPanelComponent {
  @Input() gameActive = false;
  @Input() hasGold = false;
  @Input() gameId: string | undefined;

  @Output() move = new EventEmitter<string>();
  @Output() grab = new EventEmitter<void>();
  @Output() surrender = new EventEmitter<void>();

  showConfirm = false;

  confirmSurrender(): void {
    this.showConfirm = true;
  }

  doSurrender(): void {
    this.showConfirm = false;
    this.surrender.emit();
  }
}
