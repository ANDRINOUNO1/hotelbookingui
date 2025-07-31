import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  keepLoggedIn = false;
  showPassword = false;
  error = '';
  isLoading = false;
  rightImage = ''; 

  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupMsg = '';

  activeTab: 'signin' | 'signup' = 'signin';

  constructor(private router: Router, private accountService: AccountService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.isLoading = true;
    this.error = '';
    
    // FIX: Pass 'this.email' to the login service
    this.accountService.login(this.email, this.password).subscribe({
      next: (account) => {
        this.isLoading = false;

        localStorage.setItem('user', JSON.stringify(account));
        
        if (account.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (account.role === 'SuperAdmin') {
          this.router.navigate(['/superadmin']);
        } else {
          this.router.navigate(['/frontdesk']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err?.error?.message || 'Invalid credentials!';
        console.log('Login failed, account state:', this.accountService.accountValue);
      }
    });
  }
}
