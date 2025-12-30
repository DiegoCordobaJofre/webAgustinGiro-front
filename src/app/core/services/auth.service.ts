import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, LoginResponse, AuthState } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';
  private authStateSubject = new BehaviorSubject<AuthState>(this.getInitialAuthState());
  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAuthState();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.updateAuthState({ isAuthenticated: true, token: response.token });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.updateAuthState({ isAuthenticated: false });
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getInitialAuthState(): AuthState {
    const token = localStorage.getItem(this.tokenKey);
    return {
      isAuthenticated: !!token,
      token: token || undefined
    };
  }

  private loadAuthState(): void {
    const state = this.getInitialAuthState();
    this.updateAuthState(state);
  }

  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }
}


