
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, AuthPayload, AuthUser } from '../../models/social.models';

const TOKEN_KEY = 'socialToken';
const USER_KEY = 'socialUser';
const NAME_KEY = 'userName';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<AuthUser | null>(this.readUser());
  readonly currentUserName = signal<string>(this.readUser()?.name || localStorage.getItem(NAME_KEY) || 'User');

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  signup(data: Record<string, unknown>) {
    return this.http.post<ApiResponse<AuthPayload>>(`${environment.apiUrl}/users/signup`, data);
  }

  signin(data: { login: string; password: string }) {
    return this.http.post<ApiResponse<AuthPayload>>(`${environment.apiUrl}/users/signin`, data).pipe(
      tap((res) => this.persistSession(res.data)),
    );
  }

  changePassword(data: { password: string; newPassword: string }) {
    return this.http
      .patch<ApiResponse<AuthPayload>>(`${environment.apiUrl}/users/change-password`, data)
      .pipe(
        tap((res) => {
          if (res.data?.token) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
          }
          if (res.data?.user) {
            this.setUser(res.data.user);
          }
        }),
      );
  }

  loadProfile() {
    return this.http.get<ApiResponse<{ user: AuthUser }>>(`${environment.apiUrl}/users/profile-data`).pipe(
      tap((res) => {
        if (res.data?.user) this.setUser(res.data.user);
      }),
    );
  }

  persistSession(payload: AuthPayload): void {
    localStorage.setItem(TOKEN_KEY, payload.token);
    this.setUser(payload.user);
  }

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(NAME_KEY, user.name);
    this.currentUser.set(user);
    this.currentUserName.set(user.name);
  }

  logout(navigate = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(NAME_KEY);
    this.currentUser.set(null);
    this.currentUserName.set('User');
    if (navigate) {
      void this.router.navigate(['/login']);
    }
  }

  private readUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

