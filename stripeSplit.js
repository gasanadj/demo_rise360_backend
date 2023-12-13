const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: "usd",
});

// Split the payment among sellers
const transferGroup = "ORDER123";

// Seller 1
const transfer1 = await stripe.transfers.create({
  amount: 500, // Amount for Seller 1 in cents
  currency: "usd",
  destination: "seller1_account_id",
  transfer_group: transferGroup,
});

// Seller 2
const transfer2 = await stripe.transfers.create({
  amount: 500,
  currency: "usd",
  destination: "seller2_account_id",
  transfer_group: transferGroup,
});

// Update the payment intent with the transfer group
await stripe.paymentIntents.update(paymentIntent.id, {
  transfer_group: transferGroup,
});
