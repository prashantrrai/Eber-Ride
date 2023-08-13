import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/Service/socket.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FeedbackComponent } from 'src/app/shared/feedback/feedback.component';

@Component({
  selector: 'app-runningrequest',
  templateUrl: './runningrequest.component.html',
  styleUrls: ['./runningrequest.component.css']
})
export class RunningrequestComponent {
  assignedArray: any;
  driverId: any;
  rideId: any;
  driverdata: any;

  constructor(
    private _socketservice: SocketService,
    private toastr: ToastrService,
    private _socket: SocketService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getRunningData();
    this.assigneddriverfromAssignDialogBox();
    this.afterrejectrunningrequest();
    this.listenassignrejected()
    this.ridestatusupates()
    this.timeoutrunningreq()
    this.listeningwhendriverisnearest()
    this.listeningmytaskfunc()
    this.listennearestassignbuttonclick()
  }

  getRunningData() {
    this._socketservice.emitRunningData()

    this._socketservice.listenGetRunning().subscribe((data: any) => {
      console.log(data);
      this.assignedArray = data.alldata;
      console.log(this.assignedArray);
      
    });
  }

  //---------------ON REJECT RIDE REQUEST BUTTON CLICK--------------------//
  rejectRide(data: any) {
    this.rideId = data._id
    this.driverId = data.driverId

    this.rejectRunningRequest(this.driverId, this.rideId);
  }

  //------------------------------RUNNING REQUEST REJECT------------------------------------//
  rejectRunningRequest(driverId: string, rideId: string) {
    console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this._socketservice.emitrejectRunningRequest(data)
    this.getRunningData()
  }



  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  acceptRide(data: any){
    // console.log(data);
    this.rideId = data._id
    this.driverId = data.driverId

    this.acceptrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  arriveRide(data: any){
    this.rideId = data._id

    this.arrivedrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  pickRide(data: any){
    this.rideId = data._id

    this.pickedrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  startRide(data: any){
    this.rideId = data._id

    this.startedrunningrequest(this.driverId, this.rideId);
  }
  
  
  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  completeRide(data: any){
    // console.log(data);
    this.rideId = data._id
    this.driverId = data.driverId

    this.completedrunningrequest(this.driverId, this.rideId);
  }

  //---------------ON ACCEPT RIDE REQUEST BUTTON CLICK--------------------//
  freerideanddriver(data: any){
    // console.log(data);
    this.rideId = data._id
    this.driverId = data.driverId

    this.freerideanddriverrunningrequest(this.driverId, this.rideId);


    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true; 
    dialogConfig.width = '650px'; 
    dialogConfig.height = '700px'; 
    dialogConfig.data = data; 

    const dialogRef = this.dialog.open(FeedbackComponent, dialogConfig);
  
    // Handle dialog close events if needed
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
    });
  }

  //------------------------------ACCEPT REQUEST REJECT------------------------------------//
  acceptrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
    
    this._socketservice.emitaccept( data)
    this.getRunningData()
  }
  
  arrivedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
  
    this._socketservice.emitarrived( data)
    this.getRunningData()
  }
  pickedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
    
    this._socketservice.emitpicked( data)
    this.getRunningData()
  }

  startedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
    
    this._socketservice.emitstarted( data)
    this.getRunningData()
  }

  completedrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
    
    this._socketservice.emitcompleted( data)
    this.getRunningData()
  }

  freerideanddriverrunningrequest(driverId: string, rideId: string) {
    // console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }
    
    this._socketservice.emitfree( data)
    this.getRunningData()
  }
  //--------------------AFTER ACCEPTING RIDE-----------------------//
  ridestatusupates() {
    this._socketservice.listeningrideupdates().subscribe((response: any) => {
      this.getRunningData()
    } );
  }

  
  //-------------------AFTER REJECTING RIDE ASSIGN ONE-------------------------//
  listenassignrejected() {
    this._socketservice.listenassignrejected().subscribe((response: any) => {
      this.getRunningData()
    }
    );
  }

  //-----------------REJECT NEAREST ASSIGN RIDE------------------//
  afterrejectrunningrequest() {
    this._socketservice.listenrejectRunningRequest().subscribe((response: any) => {
      this.getRunningData()
    }
    );
  }



  //  when the assign the driver data that time show a running requeszt data 
  assigneddriverfromAssignDialogBox() {
    this._socketservice.onFinalassignedDriverData('data').subscribe((res: any) => {
      this.getRunningData()
    })
  }

  //---------------------WHEN NEAREST ASSIGN CLICKED--------------------//
  listennearestassignbuttonclick() {
    this._socketservice.listeningnearestdriver().subscribe((res: any) => {
      console.log(res);
      
      this.getRunningData()
    })
  }

  //------------TIMEOUT RUNNING REQUEST--------------------//
  timeoutrunningreq() {
    this._socketservice.listeningrunningtimeoutinRR().subscribe((res: any) => {
      // console.log("socket called", res);
      
      this.getRunningData()
      // this.toastr.success("Sorry! Ride Timeout")
    })
  }

    //------------TIMEOUT RUNNING REQUEST--------------------//
    listeningmytaskfunc(){
      this._socket.listeningmytaskfunc().subscribe((response: any)=> {

        this.getRunningData();
      })
    }
  
  //------------TIMEOUT RUNNING REQUEST--------------------//
  listeningwhendriverisnearest(){
    this._socket.listeningwhendriverisnearest().subscribe((response: any)=> {

      this.getRunningData();
    })
  }

  //---------------------------OPEN FEEDBACK FORM------------------------------//
  openDialog(): void {

    const dialogConfig = new MatDialogConfig();
    
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true; 
    dialogConfig.width = '1000px'; 
    // dialogConfig.data = ride; 

    const dialogRef = this.dialog.open(FeedbackComponent, dialogConfig);
  
    // Handle dialog close events if needed
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
    });
  }


}
