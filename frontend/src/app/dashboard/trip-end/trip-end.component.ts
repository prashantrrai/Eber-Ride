import { Component, OnInit } from '@angular/core';
declare var Stripe: any;

@Component({
  selector: 'app-trip-end',
  templateUrl: './trip-end.component.html',
  styleUrls: ['./trip-end.component.css']
})
export class TripEndComponent implements OnInit{
  private stripe: any;
  private card: any;  

  constructor() {
    this.stripe = Stripe('pk_test_51NZeiUANXK9scyulUjawM5Gzvx6F6MOm8nzHj96fghdbp1d6bOwX6ttQBrtNXXHAi5S5ga7RH7MHyRwpqUXFSJ6Q00kvn8Jkgu');
  }

  ngOnInit(): void {
    // Create a new card element and mount it to the DOM
    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');
  }

  async confirmPayment() {
    const { token, error } = await this.stripe.createToken(this.card);
    if (error) {
      // Handle error
      console.error(error);
    } else {
      // Send the token to your backend for payment processing
      this.sendTokenToServer(token);
    }
  }

  sendTokenToServer(token: any) {
    // Send the token to your Node.js backend to process the payment
    // You can use Angular's HTTP client or any other method to send the token
    // to your server where you'll create the charge using the Stripe API
    // Example using Angular's HTTP client:
    // this.httpClient.post('/your-server-endpoint', { token }).subscribe(
    //   (response) => {
    //     // Handle server response
    //   },
    //   (error) => {
    //     // Handle error
    //   }
    // );
  }

}
