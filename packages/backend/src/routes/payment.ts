import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { isAuthenticated } from '../middleware/auth'

const paymentRouter = express.Router()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create a Razorpay order
paymentRouter.post('/create-order', isAuthenticated, async (req, res) => {
  try {
    const { plan } = req.body

    // Define plan amounts in paise (1 INR = 100 paise)
    const planAmounts = {
      pro: {
        monthly: 149900, // ₹1,499
        yearly: 1439900, // ₹14,399 (20% discount on yearly)
      },
      enterprise: {
        monthly: 499900, // ₹4,999
        yearly: 4799900, // ₹47,999 (20% discount on yearly)
      },
    }

    const amount = planAmounts[plan.type][plan.interval]
    
    const options = {
      amount,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        planType: plan.type,
        interval: plan.interval,
      },
    }

    const order = await razorpay.orders.create(options)

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    res.status(500).json({
      error: error.message || 'Failed to create order',
    })
  }
})

// Verify payment signature
paymentRouter.post('/verify-payment', isAuthenticated, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // TODO: Update user's subscription status in database
      res.json({
        success: true,
        message: 'Payment verified successfully',
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      })
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment',
    })
  }
})

export { paymentRouter } 