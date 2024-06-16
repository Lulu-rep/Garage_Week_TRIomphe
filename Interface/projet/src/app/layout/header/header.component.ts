import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private userService: UserService, private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/';
  }

  logout() {
    this.userService.logout().subscribe(() => {
      this.router.navigate(['']);
    });
  }
}
