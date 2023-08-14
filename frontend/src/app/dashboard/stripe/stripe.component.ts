import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { StripeService } from 'src/app/Service/stripe.service';
import { loadStripe, } from '@stripe/stripe-js';


@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.css']
})
export class StripeComponent {
  selectddefaultid: any;
  defalutcard: any;
  cardLists: any;
  AddCardUser: any;
  cardlist: any = true;
  stripe: any;
  cardElement: any;
  paymentElement: any;
  elements: any;
  addcard: any;
  userid: any;
  userdata: any;
  carddata: any[] = [];
  isDefault: any;

  
  constructor(public dialogRef: MatDialogRef<StripeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: userdata, private http: HttpClient, private toster: ToastrService , private _stripeService : StripeService) { }


    async ngOnInit() {
      // console.log(this.data);
  
  
      this.userdata = this.data.userdata;
      this.userid = this.userdata._id
      // console.log(this.userdata);
  
      this.stripe = await loadStripe('pk_test_51NZeiUANXK9scyulUjawM5Gzvx6F6MOm8nzHj96fghdbp1d6bOwX6ttQBrtNXXHAi5S5ga7RH7MHyRwpqUXFSJ6Q00kvn8Jkgu');
      this.elements = this.stripe.elements();
  
  
      this.cardElement = this.elements.create('card');
  
      this.cardElement.mount('#card-element');
      this.getCard(this.userid)
  
  
    }
    // setDefault() {
    //   this.isDefault = !this.isDefault;
    // }
  

    //------------------------------------------ADD CARD STRIPE-----------------------------------------//  
    async addCard(id: any) {
      // console.log(id);
  
        const paymentMethod = await this.stripe.createToken(
          this.cardElement,
        );
        const token = await paymentMethod.token
        console.log('succes: ',await  paymentMethod.token);
        console.log("Token:", token);
        
  
        // const response = await fetch(`http://localhost:4000/addcard/${id}`, {
        const response = await fetch(`http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com/addcard/${id}`, {
          method: 'POST',
          headers: {
            'Content-type': 'Application/json'
          },
          body: JSON.stringify({token})
        });
  
        this.getCard(this.userid);
  
    }
  

    //------------------------------------------GET CARD STRIPE-----------------------------------------// 
    getCard(id: any) {
      const userid = id
      
      this._stripeService.getcard(id).subscribe({
        next: (response: any) => {
          this.carddata = response.paymentMethodsData;
          console.log(this.carddata);
  
  
        },
        error: (error) => {
          console.log(error);
        }
      })
    }
  
  
  //------------------------------------------DELETE CARD STRIPE-----------------------------------------// 
   deleteCard(id: any) {
    console.log(id);

    // const confirmDelete = confirm("Are you sure you want to delete this card?");
    // if (confirmDelete) {
        this._stripeService.deletecard(id).subscribe({
          next: (res: any) => {
            this.toster.success(res.message)
            this.getCard(this.userid)
          },
          error: (error) => {
            console.log(error);
          }
        })
      // }
    }
  
    async setdefaultCard(customerId: any,cardId: any) {
      console.log(customerId);
      console.log(cardId);
      this.http
        // .patch(`http://localhost:4000/setdefaultcard/${customerId}`, { cardId })
        .patch(`http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com/setdefaultcard/${customerId}`, { cardId })
        .subscribe(
          (data:any) => {
            console.log(data);
            this.isDefault = cardId;
             this.getCard(this.userid)
          },
          (error:any) => {
            console.error("Error:", error);
          }
        );
    }
  
  
    closeDialog(): void {
      this.dialogRef.close();
    }
  
  
  }
  export interface userdata {
    userdata: String;
  }