import { AfterViewInit, Component, ElementRef, Input, OnInit, SimpleChange, SimpleChanges, ViewChild, } from '@angular/core';
import { AuthService } from '../utils/auth.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @Input() isOpen: boolean = false;

  @ViewChild('endOfChat') endOfChat!: ElementRef

  messageControl: FormControl = new FormControl('');

  colorback: string = 'blue'

  mostrarChat:boolean = true
  usuarioLogueado: any
  userId: string
  newMessage: string

  messages$: any = [
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-6dd2296a7dfa", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Delivery Man", 
          type : "delivery-man" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Hey User!", 
      readUser : [ 
          { 
              id : 11, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              background: 'red',
              readedAt: 1685927914 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              background: 'blue',
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : "14", 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Hi Delivery Man", 
      readUser : [ 
          { 
              id : 60, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914 
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-6dd2296a7dfa", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Delivery Man", 
          type : "delivery-man" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Your order is ready", 
      readUser : [ 
          { 
              id : 11, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-6dd2296a7dfa", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Delivery Man", 
          type : "delivery-man" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "The estimated time is 1 hours. I'll call you when I arrive.", 
      readUser : [ 
          { 
              id : 11, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : "14", 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Great!. I'll be waiting", 
      readUser : [ 
          { 
              id : 60, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914 
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : "60", 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Great...", 
      readUser : [ 
          { 
              id : 60, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914 
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : "14", 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Ok!", 
      readUser : [ 
          { 
              id : 60, 
              name : "Fulano de tal", 
              type : "delivery-man", 
              readedAt: 1685927914 
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914 
          } 
      ], 
      createdAt : 1685927914
    },
  ]

  constructor(
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.getUserDetails().then(
      usuario => {
        this.usuarioLogueado = usuario
        let userId = this.usuarioLogueado.find(user => user.Name == 'custom:_id')
        this.userId = userId.Value
        this.scrollToBottom()
      }
    )
  }

  // ngOnChanges(changes: SimpleChanges){
  //   if(changes.isOpen.currentValue == true){
  //     this.scrollToBottom()
  //   }
  // }

  sendMessage(){
    const message = this.messageControl.value;
    if(message){
      let messageBody = {
        uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63",  
        uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
        user : { 
            id : this.userId, 
            name : "Cristhian Angel Ticclla Espinoza", 
            type : "agent-store" 
        }, 
        store : { 
            id : 16, 
            name : "tambo Salguero" 
        }, 
        body : message, 
        readUser : [ 

        ], 
        createdAt : 1685927914
      }
      this.messages$.push(messageBody)
      this.messageControl.setValue('')
      this.scrollToBottom()
    }

  }

  scrollToBottom(){
    setTimeout(() => {
      if(this.endOfChat){
        this.endOfChat.nativeElement.scrollIntoView({behavior: "smooth"})
      }
    }, 10)
  }

  getFormatDate(timestamp : number){
    const date = new Date(timestamp * 1000);

    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);

    let hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // Si hours es 0, asigna 12 en su lugar

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;

    return formattedDate
  }

}
