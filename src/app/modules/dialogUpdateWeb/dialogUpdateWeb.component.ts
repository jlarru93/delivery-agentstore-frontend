import { Component } from "@angular/core";

@Component({
  selector: 'app-dialogUpdate-web',
  templateUrl: './dialogUpdateWeb.component.html'
})
export class DialogUpdateWebComponent {
  isShowAlert:boolean = false
  updatePage(){
    window.location.reload()
  }

  showMessage(){
    this.isShowAlert = true
  }
}
