import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-box',
  standalone: true,
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.css']
})
export class BoxComponent {
  @Input() type: string = ''; // Type de données : 'Température', 'Poussière', 'Lumière', etc.
  @Input() averageValue: number = 0; // Propriété pour la moyenne
  @Input() instantValue: number = 0; // Propriété pour la valeur instantanée

  showMore() {
    console.log(`Afficher plus de données pour ${this.type}`);
    // Logique pour afficher plus de données spécifiques au type
  }
}
