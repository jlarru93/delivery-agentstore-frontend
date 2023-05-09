import { Component, OnInit } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { OrderBean } from "../data";
import { ProductService } from "src/app/demo/service/productservice";
import { Product } from "src/app/demo/domain/product";

@Component({
    selector: 'app-stores',
    templateUrl: './orderDialog.component.html',
    styleUrls: ['./orderDialog.component.scss']
  })
export class OrderDialogComponent implements OnInit{
    order:OrderBean
    products: Product[];
    displayOrder=true
    constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig,private productService: ProductService) { }
    ngOnInit(): void {
        this.productService.getProductsWithOrdersSmall().then(data => this.products = data);
    }
    

}