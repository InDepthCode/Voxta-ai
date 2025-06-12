import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: any;
  }
}

const tiers = [
  {
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Perfect for trying out Voxta',
    features: [
      'Basic calendar management',
      'Limited email integration',
      '10 AI interactions per day',
      'Basic task management',
      'Community support',
    ],
    buttonText: 'Get Started',
    mostPopular: false,
    type: 'free',
  },
  {
    name: 'Pro',
    price: 1499,
    period: '/month',
    description: 'Ideal for professionals and small teams',
    features: [
      'Advanced calendar management',
      'Full email integration',
      'Unlimited AI interactions',
      'Advanced task management',
      'Priority support',
      'Custom integrations',
      'Team collaboration',
    ],
    buttonText: 'Start Pro Plan',
    mostPopular: true,
    type: 'pro',
  },
  {
    name: 'Enterprise',
    price: 4999,
    period: '/month',
    description: 'For organizations with advanced needs',
    features: [
      'Everything in Pro',
      'Custom AI training',
      'Advanced analytics',
      'API access',
      'Dedicated support',
      'SLA guarantees',
      'Custom features',
      'Enterprise security',
    ],
    buttonText: 'Contact Sales',
    mostPopular: false,
    type: 'enterprise',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { isSignedIn, user } = useAuth()

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePlanSelect = async (tier: typeof tiers[0]) => {
    if (!isSignedIn) {
      // Store the selected plan in session storage so we can redirect back after sign in
      sessionStorage.setItem('selectedPlan', tier.name)
      navigate('/sign-in')
      return
    }

    if (tier.type === 'free') {
      // Handle free plan selection
      toast.success('Welcome to the Free plan!')
      navigate('/dashboard')
      return
    }

    if (tier.type === 'enterprise') {
      window.location.href = 'mailto:sales@voxta.ai'
      return
    }

    try {
      setIsLoading(true)

      // Create order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: {
            type: tier.type,
            interval: annual ? 'yearly' : 'monthly',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Initialize Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Voxta AI',
        description: `${tier.name} Plan - ${annual ? 'Annual' : 'Monthly'}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              toast.success('Payment successful! Welcome to your new plan.')
              navigate('/dashboard')
            } else {
              toast.error('Payment verification failed. Please contact support.')
            }
          } catch (error) {
            console.error('Error verifying payment:', error)
            toast.error('Failed to verify payment. Please contact support.')
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
        },
        theme: {
          color: '#6366f1',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Error processing payment:', error)
      toast.error(error.message || 'Failed to process payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-16 px-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. All plans include a 14-day free trial.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mt-12 mb-16">
        <div className="relative flex items-center p-1 bg-gray-100 rounded-full">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              !annual
                ? 'text-white bg-primary-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              annual
                ? 'text-white bg-primary-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-1 text-xs text-primary-200">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl ${
              tier.mostPopular
                ? 'bg-primary-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-900 border border-gray-200'
            } p-8`}
          >
            {tier.mostPopular && (
              <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-2 text-sm font-medium text-white text-center shadow-md">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
              <p className={tier.mostPopular ? 'text-primary-100' : 'text-gray-500'}>
                {tier.description}
              </p>
            </div>

            <div className="mb-8">
              <p className="flex items-baseline">
                <span className="text-4xl font-bold tracking-tight">
                  ₹{annual ? Math.round(tier.price * 0.8 * 12).toLocaleString('en-IN') : tier.price.toLocaleString('en-IN')}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  {annual ? '/year' : tier.period}
                </span>
              </p>
            </div>

            <ul className="mb-8 space-y-4 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      tier.mostPopular ? 'text-primary-200' : 'text-primary-600'
                    }`}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(tier)}
              disabled={isLoading}
              className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all hover:scale-105 ${
                tier.mostPopular
                  ? 'bg-white text-primary-600 hover:bg-gray-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : tier.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto grid gap-8 sm:grid-cols-2">
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Can I switch plans later?
            </h3>
            <p className="text-gray-500">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-500">
              We accept all major credit/debit cards, UPI, and net banking through Razorpay.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-500">
              Yes, all paid plans come with a 14-day free trial. No credit card required for the Free plan.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              What happens after my trial ends?
            </h3>
            <p className="text-gray-500">
              After your trial ends, you'll be automatically switched to the Free plan unless you choose to upgrade.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 