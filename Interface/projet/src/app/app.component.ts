import { Component } from '@angular/core';
import { BoxComponent } from './components/box/box.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoxComponent], // Importez le composant autonome ici
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-app';
}
