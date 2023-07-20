import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  constructor() { }

  status: any[] = [
    { name: 'Cancelado', value: 'done'},
  ]
  isDialogDetailOpen: boolean = false

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

  ngOnInit(): void {

  }

}
