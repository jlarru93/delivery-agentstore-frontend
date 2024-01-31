import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA  } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  imagenURL: string

  constructor(
    private dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.imagenURL  = data.imagenURL
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
