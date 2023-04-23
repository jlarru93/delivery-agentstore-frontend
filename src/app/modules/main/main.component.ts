import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
@Component({
    selector: 'app-stores',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    providers: [ConfirmationService, MessageService]
  })
  export class MainComponent implements OnInit {
    progress: number = 0;
    noOfFiles: number = 13;
    completed: boolean = false;
    ngOnInit(): void {
      this.updateProgress();
    }
    delay(ms: number) {
      return new Promise((resolve, reject) => setTimeout(resolve, ms));
    }
  
    async updateProgress() {
      this.completed = false;
      let n = 100 / this.noOfFiles;
      for (let i = 0; i <= this.noOfFiles; i++) {
        await this.delay(500);
        this.progress = Math.round(i * n);
        console.log(i);
      }
      this.completed = true;
    }
}