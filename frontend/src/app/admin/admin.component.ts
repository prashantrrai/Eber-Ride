import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Service/api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    
    constructor(private _api: ApiService) { }

    // personDataArray: any[] = this._api.personDataArray
    personDataArray: any
    ngOnInit(): void {
      this._api.getuserData().subscribe({
        next:(users:any)=>{
          this.personDataArray= users.data
        },
        error:(err)=>{
          alert(err)
        }
      })
    }



}