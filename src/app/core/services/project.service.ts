import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Project,
  ProjectCreateDto,
  ProjectImage,
  ProjectUpdateDto
} from '../../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  create(project: ProjectCreateDto): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  update(id: number, project: ProjectUpdateDto): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Sube una imagen asociada a un proyecto. El backend la guarda en Cloudflare R2
   * y persiste el metadata. Devuelve la imagen ya creada (con id y url publica de R2).
   */
  uploadImage(
    projectId: number,
    file: File,
    options: { alt?: string; isMain?: boolean } = {}
  ): Observable<ProjectImage> {
    const formData = new FormData();
    formData.append('file', file);
    if (options.alt) {
      formData.append('alt', options.alt);
    }
    if (typeof options.isMain === 'boolean') {
      formData.append('isMain', String(options.isMain));
    }
    return this.http.post<ProjectImage>(
      `${this.apiUrl}/${projectId}/images`,
      formData
    );
  }

  deleteImage(projectId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${projectId}/images/${imageId}`
    );
  }
}








