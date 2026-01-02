import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';
import { Project, ProjectStatus, ProjectCreateDto, ProjectUpdateDto } from '../../../../models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  isLoading = false;

  statusOptions = [
    { value: ProjectStatus.IN_EXECUTION, label: 'En ejecución' },
    { value: ProjectStatus.LICENSING_PHASE, label: 'Fase Licenciamiento' },
    { value: ProjectStatus.PREVIOUS_STUDY, label: 'Fase Estudio-Previo' },
    { value: ProjectStatus.COMPLETED, label: 'Completado' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      status: [ProjectStatus.IN_EXECUTION, [Validators.required]],
      featured: [false],
      showInMenu: [true],
      images: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = +id;
      this.loadProject(+id);
    }
  }

  get imagesFormArray(): FormArray {
    return this.projectForm.get('images') as FormArray;
  }

  private loadProject(id: number): void {
    this.projectService.getById(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          title: project.title,
          description: project.description,
          category: project.category,
          status: project.status,
          featured: project.featured ?? false,
          showInMenu: project.showInMenu ?? true
        });

        if (project.images && project.images.length > 0) {
          project.images.forEach(image => {
            this.addImage(image.url, image.alt, image.order, image.isMain);
          });
        }
      },
      error: () => {
        alert('Error al cargar el proyecto');
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  addImage(url: string = '', alt: string = '', order: number = 0, isMain: boolean = false): void {
    const imageGroup = this.fb.group({
      url: [url, [Validators.required]],
      alt: [alt, [Validators.required]],
      order: [order, [Validators.required]],
      isMain: [isMain]
    });

    this.imagesFormArray.push(imageGroup);
  }

  removeImage(index: number): void {
    this.imagesFormArray.removeAt(index);
  }

  addNewImage(): void {
    const nextOrder = this.imagesFormArray.length;
    this.addImage('', '', nextOrder, false);
  }

  setMainImage(index: number): void {
    this.imagesFormArray.controls.forEach((control, i) => {
      control.patchValue({ isMain: i === index });
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.isLoading = true;
      const formValue = this.projectForm.value;

      if (this.isEditMode && this.projectId) {
        const updateDto: ProjectUpdateDto = formValue;
        this.projectService.update(this.projectId, updateDto).subscribe({
          next: () => {
            this.router.navigate(['/admin/dashboard']);
          },
          error: () => {
            alert('Error al actualizar el proyecto');
            this.isLoading = false;
          }
        });
      } else {
        const createDto: ProjectCreateDto = formValue;
        this.projectService.create(createDto).subscribe({
          next: () => {
            this.router.navigate(['/admin/dashboard']);
          },
          error: () => {
            alert('Error al crear el proyecto');
            this.isLoading = false;
          }
        });
      }
    }
  }
}



