require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_Secret_key);
console.log(process.env.STRIPE_Secret_key);

// //--------------------Function to create a Stripe customer------------------------------//
// const createStripeCustomer = async (email) => {
//   try {
//     const customer = await stripe.customers.create({ email });
//     return customer;
//   } catch (error) {
//     throw new Error('Failed to create Stripe customer: ' + error.message);
//   }
// };



// //----------------------------Function to add a card to a customer------------------------------------//
// const addCardToCustomer = async (customerId, cardToken) => {
//   try {
//     await stripe.paymentMethods.attach(cardToken, { customer: customerId });
//     await stripe.customers.update(customerId, {
//       invoice_settings: {
//         default_payment_method: cardToken,
//       },
//     });
//   } catch (error) {
//     throw new Error('Failed to add card to customer: ' + error.message);
//   }
// };



// //--------------------------------------Function to charge a customer----------------------------------//
// const chargeCustomer = async (customerId, amount) => {
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency: 'usd',
//       customer: customerId,
//       description: 'Trip fare',
//       payment_method_types: ['card'],
//     });
//     return paymentIntent;
//   } catch (error) {
//     throw new Error('Failed to create payment intent: ' + error.message);
//   }
// }



// //--------------------------Function to add a bank account to a driver------------------------------------//
// const addBankAccountToDriver = async (driverId, accountNumber, routingNumber) => {
//   try {
//     await stripe.accounts.createExternalAccount(driverId, {
//       external_account: {
//         object: 'bank_account',
//         account_number: accountNumber,
//         routing_number: routingNumber,
//         country: 'US',
//         currency: 'usd',
//       },
//     });
//   } catch (error) {
//     throw new Error('Failed to add bank account to driver: ' + error.message);
//   }
// };
  
// //-----------------------------Function to transfer money to a driver's bank account-------------------------------//
// const transferToDriver = async (driverId, amount) => {
//   try {
//     const transfer = await stripe.transfers.create({
//       amount,
//       currency: 'usd',
//       destination: driverId,
//       transfer_group: 'driver_payout',
//     });
//     return transfer;
//   } catch (error) {
//     throw new Error('Failed to transfer money to driver: ' + error.message);
//   }
// };



// Function to create a Stripe customer from the second code snippet        
const createCustomer = async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      name: req.body.name,
      email: req.body.email,
    });

    res.status(200).send(customer);
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}

// Function to add a new card from the second code snippet
const addNewCard = async (req, res) => {
  try {

    const {
      customer_id,
      card_Name,
      card_ExpYear,
      card_ExpMonth,
      card_Number,
      card_CVC,
    } = req.body;

    const card_token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_year: card_ExpYear,
        exp_month: card_ExpMonth,
        cvc: card_CVC,
      },
    });

    const card = await stripe.customers.createSource(customer_id, {
      source: `${card_token.id}`,
    });

    res.status(200).send({ card: card.id });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};



// Function to create charges from the second code snippet
const createCharges = async (req, res) => {
  try {
    const createCharge = await stripe.charges.create({
      receipt_email: 'tester@gmail.com',
      amount: parseInt(req.body.amount) * 100, // amount*100
      currency: 'INR',
      card: req.body.card_id,
      customer: req.body.customer_id,
    });

    res.status(200).send(createCharge);
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

module.exports = {
  // createStripeCustomer,
  // addCardToCustomer,
  // chargeCustomer,
  // addBankAccountToDriver,
  // transferToDriver,

  createCustomer,
  addNewCard,
  createCharges
};
  
// module.exports = {createStripeCustomer, addCardToCustomer, chargeCustomer, addBankAccountToDriver, transferToDriver};