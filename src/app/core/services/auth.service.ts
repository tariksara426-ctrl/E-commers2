import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser } from '../models/ecommerce.models';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly isLoggedIn = signal<boolean>(this.hasValidToken());

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  signup(data: { name: string; email: string; password: string; rePassword: string; phone: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/signup`, data);
  }

  signin(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/v1/auth/signin`, data).pipe(
      tap((res) => {
        if (res.token) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  forgotPasswords(email: string): Observable<{ statusMsg: string; message: string }> {
    return this.http.post<{ statusMsg: string; message: string }>(
      `${environment.apiUrl}/api/v1/auth/forgotPasswords`,
      { email }
    );
  }

  verifyResetCode(resetCode: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(
      `${environment.apiUrl}/api/v1/auth/verifyResetCode`,
      { resetCode }
    );
  }

  resetPassword(data: { email: string; newPassword: string }): Observable<{ token: string }> {
    return this.http.put<{ token: string }>(
      `${environment.apiUrl}/api/v1/auth/resetPassword`,
      data
    );
  }

  changeMyPassword(data: { currentPassword: string; password: string; rePassword: string }): Observable<{ message: string; token: string }> {
    return this.http.put<{ message: string; token: string }>(
      `${environment.apiUrl}/api/v1/users/changeMyPassword`,
      data
    ).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
      })
    );
  }

  updateMe(data: { name: string; email: string; phone: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/users/updateMe/`, data).pipe(
      tap((res: any) => {
        if (res?.user) {
          this.currentUser.set(res.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }
      })
    );
  }

  saveSession(token: string, user?: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    const decoded = this.decodeToken(token);
    const resolvedUser: AuthUser = user || {
      id: decoded?.id,
      _id: decoded?.id,
      name: decoded?.name || 'User',
      email: decoded?.email || '',
      role: decoded?.role || 'user',
    };
    localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
    this.currentUser.set(resolvedUser);
    this.isLoggedIn.set(true);
  }

  logout(navigate = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    if (navigate) {
      void this.router.navigate(['/login']);
    }
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        const decoded = this.decodeToken(token);
        if (decoded) {
          return {
            id: decoded.id,
            _id: decoded.id,
            name: decoded.name || 'User',
            email: decoded.email || '',
            role: decoded.role || 'user',
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }
}
