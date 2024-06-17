import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Définition du composant AlertComponent
@Component({
  selector: 'alert-box',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  standalone: true,
  imports: [CommonModule] // Importation de CommonModule pour ngIf et ngFor
})
export class AlertComponent {
  @Input() type: string = '';
  @Input() message: string = '';
  @Input() message2: string = '';
  @Input() anomalies: string[] = []; // Liste des anomalies

  showMore() {
    console.log(`OK ${this.type}`);
  }
}
