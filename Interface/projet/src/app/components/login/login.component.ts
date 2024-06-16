import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../types';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  error: boolean = false;
  user: User = { login: '', password: '' };

  constructor(private userService: UserService, private router: Router) {}

  submit(): void {
    this.userService.login(this.user).subscribe({
      next: () => {
        this.router.navigate(['home']);
      },
      error: () => {
        this.error = true;
      },
    });
  }
}
