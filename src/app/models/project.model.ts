export interface Project {
  id?: number;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  images: ProjectImage[];
  featured?: boolean; // Aparece en el carrusel de la página principal
  showInMenu?: boolean; // Aparece en la lista de proyectos
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectImage {
  id?: number;
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export enum ProjectStatus {
  IN_EXECUTION = 'IN_EXECUTION',
  LICENSING_PHASE = 'LICENSING_PHASE',
  PREVIOUS_STUDY = 'PREVIOUS_STUDY',
  COMPLETED = 'COMPLETED'
}

export interface ProjectCreateDto {
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  images: ProjectImageCreateDto[];
  featured?: boolean;
  showInMenu?: boolean;
}

export interface ProjectImageCreateDto {
  url: string;
  alt: string;
  order: number;
  isMain: boolean;
}

export interface ProjectUpdateDto {
  title?: string;
  description?: string;
  category?: string;
  status?: ProjectStatus;
  images?: ProjectImageCreateDto[];
  featured?: boolean;
  showInMenu?: boolean;
}



