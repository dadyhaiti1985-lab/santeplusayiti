export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const STRIPE_SECRET_KEY = Netlify.env.get('STRIPE_SECRET_KEY')

  if (!STRIPE_SECRET_KEY) {
    return Response.json(
      { success: false, message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' },
      { status: 500 }
    )
  }

  try {
    const { plan, amount, currency, paymentMethodId, cardholder, saveCard } = await req.json()

    if (!amount || !paymentMethodId) {
      return Response.json(
        { success: false, message: 'amount and paymentMethodId are required' },
        { status: 400 }
      )
    }

    // Create payment intent via Stripe API
    const params = new URLSearchParams()
    params.append('amount', String(amount))
    params.append('currency', currency || 'HTG')
    params.append('payment_method', paymentMethodId)
    params.append('confirm', 'true')
    params.append('return_url', new URL(req.url).origin)
    params.append('metadata[plan]', plan || '')
    params.append('metadata[cardholder]', cardholder || '')
    params.append('metadata[timestamp]', new Date().toISOString())

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const paymentIntent = await stripeResponse.json()

    if (paymentIntent.error) {
      return Response.json(
        { success: false, message: paymentIntent.error.message },
        { status: 400 }
      )
    }

    if (paymentIntent.status === 'succeeded') {
      return Response.json({ success: true, status: 'succeeded', intentId: paymentIntent.id })
    }

    if (paymentIntent.status === 'requires_action') {
      return Response.json({
        success: true,
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id,
      })
    }

    return Response.json({
      success: true,
      status: paymentIntent.status,
      intentId: paymentIntent.id,
    })
  } catch (err) {
    return Response.json(
      { success: false, message: err.message || 'Payment processing failed' },
      { status: 500 }
    )
  }
}

export const config = {
  path: '/api/payment/create-intent',
  method: 'POST',
}
