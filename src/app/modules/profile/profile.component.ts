import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/utils/auth.service';

interface ProfileBean {
  name: string;
  email: string;
  phoneNumber: string;
  sub: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {

  loading: boolean = true;
  profile: ProfileBean = { name: '-', email: '-', phoneNumber: '-', sub: '-' };

  showDeleteDialog: boolean = false;
  readonly piwiNegociosUrl: string = 'https://negocios.piwi.pe';

  constructor(
    private auth: AuthService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.auth.getUserDetails()
      .then((attributes: { Name: string, Value: string }[]) => {
        this.profile = {
          name: this.findAttr(attributes, 'name'),
          email: this.findAttr(attributes, 'email'),
          phoneNumber: this.findAttr(attributes, 'phone_number'),
          sub: this.findAttr(attributes, 'sub')
        };
        this.loading = false;
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del perfil'
        });
        this.loading = false;
      });
  }

  private findAttr(attributes: { Name: string, Value: string }[], name: string): string {
    const found = attributes?.find(a => a.Name === name);
    return found?.Value ?? '-';
  }

  openDeleteDialog(): void {
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
  }

  openPiwiNegocios(): void {
    window.open(this.piwiNegociosUrl, '_blank', 'noopener,noreferrer');
  }
}
