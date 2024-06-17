import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-box',
  standalone: true,
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.css'],
})
export class BoxComponent {
  @Input() type: string = ''; // Type de données : 'Température', 'Poussière', 'Lumière', etc.
  @Input() averageValue?: number = 0; // Propriété pour la moyenne
  @Input() instantValue?: number = 0; // Propriété pour la valeur instantanée
  @Input() machineId!: string; // Ajout de la propriété machineId

  constructor(private router: Router) {}

  showMore() {
    this.router.navigate([`machine-details/${this.machineId}/more-details`]);
  }

  getInstantText(): string {
    switch (this.type) {
      case 'Température':
        return 'Température<br>instantanée :<br>' + this.instantValue + '°C';
      case 'Poussière':
        return (
          'Taux de poussière<br>instantané :<br>' + this.instantValue + ' pcs/L'
        );
      case 'Lumière':
        return 'Luminosité instantanée :<br>' + this.instantValue + '%';
      default:
        return 'Instantanée';
    }
  }

  getAverageText(): string {
    switch (this.type) {
      case 'Température':
        return 'Température<br>moyenne / j :<br>' + this.averageValue + '°C';
      case 'Poussière':
        return (
          'Taux de poussière<br>moyen / j :<br>' + this.averageValue + ' pcs/L'
        );
      case 'Lumière':
        return 'Luminosité moyenne / j :<br>' + this.averageValue + '%';
      default:
        return 'Instantanée';
    }
  }
}
