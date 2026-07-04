import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    @if (errorMessage) {
      <p>{{ errorMessage }}</p>
    } @else {
      <p>Authenticating...</p>
    }
  `,
})
export class CallbackComponent implements OnInit {
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.authService.handleCallback().subscribe({
      next: authenticated => {
        if (!authenticated) {
          this.errorMessage = '登录回调处理失败，请重新发起登录。';
          return;
        }

        this.userService.refreshRole();
        this.userService.refreshPermission();
        this.router.navigateByUrl(this.authService.consumePostLoginRedirectUrl());
      },
      error: () => {
        this.errorMessage = '登录回调处理失败，请重新发起登录。';
      },
    });
  }
}
