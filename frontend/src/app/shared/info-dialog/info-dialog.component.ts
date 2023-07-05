import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import {environment} from '../../environment/environment';

@Component({
  selector: "app-info-dialog",
  templateUrl: "./info-dialog.component.html",
  styleUrls: ["./info-dialog.component.css"],
})
export class InfoDialogComponent implements OnInit{
  dataArray: any[] = [];
  baseUrl = environment.baseUrl

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<InfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit(): void {
    this.dataArray = this.data;
    // console.log(this.dataArray)
  }


}
