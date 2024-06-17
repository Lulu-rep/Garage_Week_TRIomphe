import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Machine } from '../../../types';
import { UserService } from '../../service/user.service';

// Définition du composant HomeComponent
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [CommonModule],
})
export class HomeComponent {
  machines: Machine[] = [
    {
      _id: '1',
      name: 'Machine Test',
    },
  ];

  constructor(private userService: UserService, private router: Router) {}
  // Méthode pour afficher les détails d'une machine
  viewDetails(machineId: string): void {
    this.router.navigate(['/machine-details', machineId]);
  }
  // Méthode pour se déconnecter
  ngOnInit(): void {
    this.userService.isConnected().subscribe((isConnected) => {
      if (!isConnected) {
        this.router.navigate(['']);
      }
    });
  }
}
