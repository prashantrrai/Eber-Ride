const stripeService = require('../services/stripeService');

// Define your controller functions here, e.g., createStripeCustomer, addCardToCustomer, etc.
async function createCustomer(req, res) {
    try {
      const { email } = req.body;
      const customer = await stripeService.createStripeCustomer(email);
      res.status(200).json({ customer });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create customer' });
    }
}

async function addCardToCustomer(req, res) {
    try {
      const { customerId, cardToken } = req.body;
      await stripeService.addCardToCustomer(customerId, cardToken);
      res.status(200).json({ message: 'Card added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add card to customer' });
    }
}

async function processPayment(req, res) {
    try {
      const { customerId, amount } = req.body;
      const paymentIntent = await stripeService.chargeCustomer(customerId, amount);
      // Process paymentIntent or handle the response as needed
      res.status(200).json({ paymentIntent });
    } catch (error) {
      res.status(500).json({ error: 'Payment processing failed' });
    }
}


module.exports = {createCustomer, addCardToCustomer, processPayment};