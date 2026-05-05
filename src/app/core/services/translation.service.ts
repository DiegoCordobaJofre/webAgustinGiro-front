import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TranslateResponse {
  translations: { [lang: string]: string };
}

/**
 * Pide al backend que traduzca un texto a otros idiomas via DeepL.
 * Si DeepL no esta configurado en el server, devuelve translations vacias.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly apiUrl = `${environment.apiUrl}/i18n`;

  constructor(private http: HttpClient) {}

  status(): Observable<{ enabled: boolean }> {
    return this.http.get<{ enabled: boolean }>(`${this.apiUrl}/status`);
  }

  translate(
    text: string,
    sourceLang: string,
    targetLangs: string[]
  ): Observable<TranslateResponse> {
    return this.http.post<TranslateResponse>(`${this.apiUrl}/translate`, {
      text,
      sourceLang,
      targetLangs
    });
  }
}
