import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from 'src/app/utils/auth.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  status: any[] = [
    { name: 'Cancelado', value: 'done'},
  ]
  isDialogDetailOpen: boolean = false

  messageControl: FormControl = new FormControl('');

  orders = [
    {
      status: 'Cancelado',
      id: 'ID 9658246',
      date: 'Jul 01, 2020 11:41:07 AM',
      price: '$17,000',
      dm: 'Sin Deliveryman',
      rate: 'No disponible'
    },
    {
      status: 'Cancelado',
      id: 'ID 9658246',
      date: 'Jul 01, 2020 11:41:07 AM',
      price: '$17,000',
      dm: 'Sin Deliveryman',
      rate: 'No disponible'
    },
    {
      status: 'Cancelado',
      id: 'ID 9658246',
      date: 'Jul 01, 2020 11:41:07 AM',
      price: '$17,000',
      dm: 'Sin Deliveryman',
      rate: 'No disponible'
    }
  ]

  messages: any[] = [
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
  ]

  @ViewChild('endOfChat') endOfChat!: ElementRef

  items: any[]

  constructor(
    private auth : AuthService
  ) { }

  userId: any
  ngOnInit(): void {
    let userName=this.auth.getParameterToken('name')
    let id=this.auth.getParameterToken('id')
    this.userId=Number(id)

    this.items = [
      {label: 'Abierto', icon: 'pi pi-check-circle'},
      {label: 'En proceso', icon: 'pi pi-forward'},
      {label: 'Terminado', icon: 'pi pi-thumbs-up-fill'},
      {label: 'Cancelado', icon: 'pi pi-times'},
  ];

  }

  OpenDialogDetail(){
    this.isDialogDetailOpen = true;
    this.scrollToBottom()
  }

  sendMessage(){
    const message:string = this.messageControl.value.toString();
    if(message){
      let messageBody:any =
      { 
        uuid : "0d0d3958-28c1-4057-8b8f-677adad899ad63", 
        uuidOrder : "53163d28-a3fa-4208-8c16-4b64772db343", 
        user : { 
            id :  Number(this.userId), 
            name : 'Jhon', 
            type : "agent-store"
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
