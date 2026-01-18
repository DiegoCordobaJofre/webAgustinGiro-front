import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './under-construction.component.html',
  styleUrls: ['./under-construction.component.scss']
})
export class UnderConstructionComponent {
  phone = '+351 927 688 101';
  email = 'agustinezequielgiro@gmail.com';
}

