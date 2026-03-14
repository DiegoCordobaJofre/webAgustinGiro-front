import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const { name, email, message } = this.contactForm.value;
      const prefix = this.translate.instant('WHATSAPP_MSG_PREFIX');
      const labelName = this.translate.instant('WHATSAPP_LABEL_NAME');
      const labelEmail = this.translate.instant('WHATSAPP_LABEL_EMAIL');
      const labelMessage = this.translate.instant('WHATSAPP_LABEL_MESSAGE');
      const text = `*${prefix}*\n\n${labelName}: ${name}\n${labelEmail}: ${email}\n\n${labelMessage}:\n${message}`;
      const whatsappUrl = `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(text)}`;
      // Usar <a> + click evita que el bloqueador de popups en prod (Vercel) bloquee la apertura
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.contactForm.reset();
    }
  }
}







