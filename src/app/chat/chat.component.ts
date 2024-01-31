import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../utils/auth.service';
import { UntypedFormControl } from '@angular/forms';
import { ChatBean } from './data.chat';
import { USER_TYPE_AGENT_STORE } from '../utils/constant';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  //@Input() isOpen: boolean = false;
  @Input() isLoading: boolean
  @Input() messages: ChatBean[]
  @Input() orderId: string
  @Input() usuarioLogueado: string
  @Input() orderUuid: string
  @Input() userId: string
  @Input() flagMainComponent: boolean = false
  @Input() isInputEnabled: boolean = false
  @ViewChild('endOfChat') endOfChat!: ElementRef
  @Output() emitMessage = new EventEmitter<ChatBean>();
  @Output() hideChat = new EventEmitter<void>();

  messageControl: UntypedFormControl = new UntypedFormControl('');

  colorback: string = 'blue'

  mostrarChat:boolean = true
  
  
  newMessage: string

  /*messages$: ChatBean[] = [
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
          id : 14, 
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
              readedAt: 1685927914,
              background:'red'
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
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
              readedAt: 1685927914,
              background:'blue' 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
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
              readedAt: 1685927914,
              background:'blue' 
          }, 
          { 
              id : 14, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 14, 
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
              readedAt: 1685927914,
              background:'blue' 
          }, 
          { 
              id : 60, 
              name : "Pepito de los palotes", 
              type : "user", 
              readedAt : 1685927914,
              background:'blue' 
          } 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 60, 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Great...", 
      readUser : [ 
      ], 
      createdAt : 1685927914 
    },
    { 
      uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
      uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
      user : { 
          id : 14, 
          name : "Cristhian Angel Ticclla Espinoza", 
          type : "agent-store" 
      }, 
      store : { 
          id : 16, 
          name : "tambo Salguero" 
      }, 
      body : "Ok!", 
      readUser : [], 
      createdAt : 1685927914
    },
  ]*/

  constructor() { }

  ngOnInit() {
    //let userName=this.auth.getParameterToken('name')
    //let id=this.auth.getParameterToken('id')
    //this.usuarioLogueado=userName
    //this.userId=id
    //this.scrollToBottom()
  }

  // ngOnChanges(changes: SimpleChanges){
  //   if(changes.isOpen.currentValue == true){
  //     this.scrollToBottom()
  //   }
  // }

  onChatScroll(event: Event): void {
    event.stopPropagation();
  }

  sendMessage(){
    const message:string = this.messageControl.value.toString();
    if(message){
      let messageBody:ChatBean =
      { 
        uuid : uuidv4(), 
        uuidOrder : this.orderUuid, 
        user : { 
            id :  Number(this.userId), 
            name : this.usuarioLogueado, 
            type : USER_TYPE_AGENT_STORE 
        }, 
        store : { 
            id : 0, 
            name : '' 
        }, 
        body : message, 
        readUser : [], 
        createdAt : Date.now()
      }
      this.messages.push(messageBody)
      console.log("this.messages",this.messages)
      this.messageControl.setValue('')
      this.scrollToBottom()
      this.emitMessage.emit(messageBody)
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

  toggleDisplayDiv() {
    this.hideChat.emit();
  }

}
