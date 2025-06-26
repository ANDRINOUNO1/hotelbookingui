import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  keepLoggedIn = false;
  error = '';

  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupMsg = '';

  activeTab: 'signin' | 'signup' = 'signin';

  constructor(private router: Router) {}

  login() {
    // Example: Hardcoded credentials for demo
    if (this.username === 'admin' && this.password === 'admin123') {
      this.error = '';
      this.router.navigate(['/admin']);
    } else if (this.username === 'frontdesk' && this.password === 'frontdesk123') {
      this.error = '';
      this.router.navigate(['/frontdesk']);
    } else {
      this.error = 'Invalid credentials!';
    }
  }

  signup() {
    // Demo only: Show a message
    this.signupMsg = 'Account created! You can now sign in.';
    // Optionally, switch to sign in tab after a short delay
    setTimeout(() => {
      this.activeTab = 'signin';
      this.signupMsg = '';
    }, 1500);
  }
}