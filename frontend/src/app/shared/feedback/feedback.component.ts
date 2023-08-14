import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef , MatDialogConfig} from '@angular/material/dialog';
// import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit{

  // private serverUrl = 'http://localhost:4000';
  private serverUrl = 'http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com';

  feedbackForm!: FormGroup;
  
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FeedbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ){
    this.feedbackForm = this.formBuilder.group({
      name: '',
      email: '',
      phone: '',
      message: ''
  });
  }


  ngOnInit(): void {
    // console.log(this.data);
  }


submitForm() {
  const formData = this.feedbackForm.value;
  const feedbackdata = this.data;
  // console.log('Form Data:', formData);

  const message = {
    formData, 
    feedbackdata
  }
  console.log(message);
  
  this.http.post<any>(`${this.serverUrl}/feedback`, message)
  .subscribe(response => {
    console.log('Backend Response:', response);
  });
}

resetForm() {
    this.feedbackForm.reset();
}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
