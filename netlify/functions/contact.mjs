export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return Response.json({ error: 'name, email and message are required' }, { status: 400 })
    }

    // Basic email validation
    if (!email.includes('@') || !email.split('@')[1]?.includes('.')) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    console.log('New contact message:', { name, email, subject, message: message.substring(0, 100) })

    return Response.json({
      ok: true,
      message: 'Message received successfully',
    })
  } catch (err) {
    return Response.json({ error: err.message || 'Failed to process contact form' }, { status: 500 })
  }
}

export const config = {
  path: '/api/contact',
  method: 'POST',
}
