import express from 'express'
import Stripe from 'stripe'
import { isAuthenticated } from '../middleware/auth'

const stripeRouter = express.Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Create a Stripe Checkout session
stripeRouter.post('/create-checkout-session', isAuthenticated, async (req, res) => {
  try {
    const { priceId } = req.body

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' })
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?session_id={CHECKOUT_SESSION_ID}&success=false`,
      automatic_tax: { enabled: true },
      customer_email: req.user?.email,
    })

    res.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({
      error: error.message || 'Failed to create checkout session',
    })
  }
})

// Create a Stripe Customer Portal session
stripeRouter.post('/create-portal-session', isAuthenticated, async (req, res) => {
  try {
    // Get or create customer
    let customer = await stripe.customers.search({
      query: `email:'${req.user?.email}'`,
    })

    if (!customer.data.length) {
      customer = await stripe.customers.create({
        email: req.user?.email,
      })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.data[0]?.id || customer.id,
      return_url: `${process.env.FRONTEND_URL}/pricing`,
    })

    res.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    res.status(500).json({
      error: error.message || 'Failed to create portal session',
    })
  }
})

export { stripeRouter } 