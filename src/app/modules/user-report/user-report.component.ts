import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserReportService } from './service/user-report.service';
import { Pagination } from 'src/app/models';
import { UserDirectionsBean, UserReportBean } from './service/data';
import { environment } from 'src/environments/environment';
import { COUNTRYCODE, NUMBERPHONELENGTH } from 'src/app/utils/constant';
import { CountryCode, CountryCodes } from 'src/app/utils/country-codes';

@Component({
  selector: 'app-user-report',
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss'],
  providers: [MessageService]
})
export class UserReportComponent implements OnInit {

  pagination: Pagination = { page: 1, size: 10, totalRecords: 0, totalNumberPages: 0 }

  countryCodes: CountryCode[] = CountryCodes;
  selectCountryCode: CountryCode = CountryCodes.find(country => country.dial_code == COUNTRYCODE);

  constructor(
    private messageServie: MessageService,
    private userReportService: UserReportService
  ){

  }
  ngOnInit(): void {
    this.onGetUsersReport()
  }

  userReportList: UserReportBean[]
  loadingResults: boolean = false
  keyWord: string = ''
  cellphone: number = null

  onGetUsersReport(){
    this.loadingResults = true
    let bodyRequest = {
      keyWord: this.keyWord,
      cellphone: this.cellphone ? this.selectCountryCode.dial_code + this.cellphone : null
    }
    this.userReportService.getUserReportList(bodyRequest, this.pagination).subscribe(
      (resp) => {
        this.userReportList = resp.data
        this.pagination.totalRecords = resp.meta.totalRecords
        this.pagination.totalNumberPages = resp.meta.totalNumberPages
        this.loadingResults = false
      },
      (error) => {
        this.messageServie.add({severity: 'error', summary: '', detail: 'Ocurrio un error'})
        this.loadingResults = false
      }
    )
  }

  onPageChangeUserReport(e: { first: number, page: number, pageCount: number, rows: number }){
    this.pagination.page = e.page + 1
    this.pagination.size = e.rows
    //this.pagination.selectRowsPer = e.rows
    this.onGetUsersReport()
  }

  userDirectionDialog: boolean = false
  openDialogDirection(user){
    this.userDirectionDialog = true
    this.onGetUserDirection(user.id)
  }


  userDirections: UserDirectionsBean[]
  loadingResults2: boolean = false
  onGetUserDirection(numberId: number){
    this.loadingResults2 = true
    this.userReportService.getUsersDirection(numberId).subscribe(
      (resp) => {
        this.userDirections = resp.data
        this.loadingResults2 = false
      }, 
      (error) => {
        this.messageServie.add({severity: 'error', summary: '', detail: 'Ocurrio un error'})
        this.loadingResults2 = false
      }
    )
  }

}
