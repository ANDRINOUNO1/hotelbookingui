import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../_services/account.service';
import { Title } from '@angular/platform-browser';
import { LoginHistoryService } from '../_services/login-history.service'; 

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

  constructor(private router: Router, private accountService: AccountService, private titleService: Title, private loginHistoryService: LoginHistoryService, // ✅ inject
) {}

  ngOnInit(): void {
    this.titleService.setTitle('BC Flats - Login');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.isLoading = true;
    this.error = '';

    this.accountService.login(this.email, this.password).subscribe({
      next: (account) => {
        this.isLoading = false;
        localStorage.setItem('user', JSON.stringify(account));
        sessionStorage.setItem('accountId', account.id.toString());

        this.loginHistoryService.createLog({
          accountId: account.id,
          action: 'login'
        }).subscribe({
          next: () => console.log('Login log created'),
          error: (err) => console.error('Failed to create login log:', err)
        });


        if (account.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (account.role === 'SuperAdmin') {
          this.router.navigate(['/superadmin']);
        } else if (account.role === 'frontdeskUser') {
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
  goToHome() {
    this.router.navigate(['/']);
    this.titleService.setTitle('BC Flats');
  }
}
