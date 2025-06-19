import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import e from 'express';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {
    if (this.username === 'admin' && this.password === 'admin123') {
      this.router.navigate(['/admin']);
    }
    else if (this.username === 'frontdesk' && this.password === 'frontdesk123'){
      this.router.navigate(['/frontdesk']);
    }
    else {
      this.error = 'Invalid credentials!';
    }
  }
}