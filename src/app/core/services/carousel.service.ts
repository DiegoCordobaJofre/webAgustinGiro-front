import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarouselItem } from '../../models/project.model';
import { environment } from '../../../environments/environment';

/**
 * Acceso al carrusel configurable de la pagina principal.
 * El GET es publico; el resto de operaciones requieren JWT (admin).
 */
@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  private readonly apiUrl = `${environment.apiUrl}/carousel`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CarouselItem[]> {
    return this.http.get<CarouselItem[]>(this.apiUrl);
  }

  create(file: File, projectId: number, grayscale: boolean): Observable<CarouselItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', String(projectId));
    formData.append('grayscale', String(grayscale));
    return this.http.post<CarouselItem>(this.apiUrl, formData);
  }

  update(
    id: number,
    changes: { projectId?: number; grayscale?: boolean }
  ): Observable<CarouselItem> {
    return this.http.put<CarouselItem>(`${this.apiUrl}/${id}`, changes);
  }

  replaceImage(id: number, file: File): Observable<CarouselItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<CarouselItem>(`${this.apiUrl}/${id}/image`, formData);
  }

  reorder(orderedIds: number[]): Observable<CarouselItem[]> {
    return this.http.put<CarouselItem[]>(`${this.apiUrl}/reorder`, { orderedIds });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
