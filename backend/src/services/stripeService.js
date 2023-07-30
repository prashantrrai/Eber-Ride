require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_Secret_key);


async function createStripeCustomer(email) {
    const customer = await stripe.customers.create({ email });
    return customer;
}

async function addCardToCustomer(customerId, cardToken) {
await stripe.paymentMethods.attach(cardToken, { customer: customerId });
await stripe.customers.update(customerId, {
    invoice_settings: {
    default_payment_method: cardToken,
    },
});
}


async function chargeCustomer(customerId, amount) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      description: 'Trip fare',
      payment_method_types: ['card'],
    });
    return paymentIntent;
}

async function addBankAccountToDriver(driverId, accountNumber, routingNumber) {
    await stripe.accounts.createExternalAccount(driverId, {
      external_account: {
        object: 'bank_account',
        account_number: accountNumber,
        routing_number: routingNumber,
        country: 'US',
        currency: 'usd',
      },
    });
}
  
async function transferToDriver(driverId, amount) {
    const transfer = await stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: driverId,
        transfer_group: 'driver_payout',
    });
    return transfer;
}
  
module.exports = {createStripeCustomer, addCardToCustomer, chargeCustomer, addBankAccountToDriver, transferToDriver};