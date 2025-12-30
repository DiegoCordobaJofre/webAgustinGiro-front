import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Project } from '../../../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  deleteProject(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.projectService.delete(id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: () => {
          alert('Error al eliminar el proyecto');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}


