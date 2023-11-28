import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { ProductService } from "./service/product.service";
import { ProductBean, StoreBean } from "./data";
import { StoreResponse } from "./service/data/response";

@Component({
    selector: 'app-stores',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    providers: [ConfirmationService, MessageService,DialogService]
})
export class ProductComponent implements OnInit {

    productSelected: ProductBean;
    products: ProductBean[];
    productsMenuSelected: ProductBean[];
    menu: string[]
    itemSelecciona: string;
    progressBar: boolean = false;
    expanded: boolean = false;

    productsCategory: ProductBean[];
    productsCategorySelected: ProductBean[];

    productDialog: boolean = false;
    deleteProductDialog: boolean = false;
    storeBean: StoreBean
    ProductOptions: any[] = [
        { name: 'EN STOCK', value: false },
        { name: 'SIN STOCK', value: true },
        { name: 'TODOS', value: -1 },
    ];
    filterProduc:any=false
    constructor(
        private productService: ProductService,
        private messageService: MessageService
    ){

    }

    ngOnInit(): void {
        this.getProducts()
    }

    getProducts(){
        this.progressBar = true
        this.productService.getProducts().subscribe((resp) => { 
            let storeBean=StoreResponse.toBean(resp.data)
            this.products=storeBean.products
            this.menu = storeBean.menu
            this.progressBar = false
            this.getProductsFromMenu()
            this.storeBean = storeBean;
        })
    }
    ChangeFilterProduc(filterProduc:any){
        if(filterProduc!=-1){
            this.products=this.storeBean.products.filter((prod)=>prod.isOutStock!=undefined&&prod.isOutStock==filterProduc)
        }else{
            this.products=this.storeBean.products
        }
    }
    getProductsFromMenu(menuSelected:string=null){
        this.progressBar = true
        this.itemSelecciona = menuSelected
        if(menuSelected){
            this.productService.getProducts().subscribe((resp) => {
                let storeBean=StoreResponse.toBean(resp.data)
                this.products=storeBean.products
                this.productsMenuSelected= this.products.filter((product)=>product.menu.includes(menuSelected))
                if(this.filterProduc!=-1){
                    this.products = this.productsMenuSelected.filter((prod)=>prod.isOutStock==this.filterProduc)
                }else{
                    this.products = this.productsMenuSelected
                }
                this.progressBar = false;
            })
        }else{
            this.productsMenuSelected= this.products
            this.progressBar = false
        }
    }
    product : ProductBean;
    productStatus : string;
    OpenProductDetail(product : ProductBean){
        this.productDialog = true;
        this.product = product
        if(product.isOutStock == false){
            this.productStatus = "En Stock";
        } else {
            this.productStatus = 'Sin Stock'
        }
    }

    statusProduct: string
    OpenDeleteDialog(product : ProductBean, status : number){
        this.deleteProductDialog = true;
        this.product = product
        if(status == 1){
            this.statusProduct = "HABILITAR"
        } else {
            this.statusProduct = "DESHABILITAR"
        }
    }

    confirmDeleteProduct(productStatus : boolean){
        let bodyRequest = {
            storeId : this.storeBean.id,
            productId : this.product.id,
            status : productStatus
        }
        this.productService.deleteProduct(bodyRequest).subscribe(resp => {
            this.deleteProductDialog = false
            console.log("respuesta ", resp)
            if(productStatus == false){
                this.messageService.add({severity:'success', summary:'Éxito', detail:'El producto ha sido habilitado'})
            }else {
                this.messageService.add({severity:'success', summary:'Éxito', detail:'El producto ha sido deshabilitado'})
            }
            this.getProducts()
        })
    }
}