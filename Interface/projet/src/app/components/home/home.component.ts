import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Machine } from '../../../types';
import { UserService } from '../../service/user.service';

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

  viewDetails(machineId: string): void {
    this.router.navigate(['/machine-details', machineId]);
  }

  ngOnInit(): void {
    this.userService.isConnected().subscribe((isConnected) => {
      if (!isConnected) {
        this.router.navigate(['']);
      }
    });
  }
}
