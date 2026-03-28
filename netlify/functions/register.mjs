export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { name, email, phone, age, plan } = await req.json()

    if (!email || !name) {
      return Response.json({ error: 'name and email are required' }, { status: 400 })
    }

    // Basic email validation
    if (!email.includes('@') || !email.split('@')[1]?.includes('.')) {
      return Response.json({ message: 'Refused', reason: 'Invalid email format' }, { status: 400 })
    }

    console.log('New registration:', { name, email, phone, age, plan })

    return Response.json({
      success: true,
      message: 'Accepted',
      customer: { name, email, phone, age, plan },
    })
  } catch (err) {
    return Response.json({ error: err.message || 'Registration failed' }, { status: 500 })
  }
}

export const config = {
  path: '/api/register',
  method: 'POST',
}
