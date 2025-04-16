export const runtime = 'edge'; // Optional for Vercel Edge Functions

export async function POST(request) {
  const formData = await request.formData();
  const audioFile = formData.get('audio');

  // Forward to your Flask backend
  const flaskResponse = await fetch('http://localhost:5000/speech-to-text', {
    method: 'POST',
    body: formData,
  });

  if (!flaskResponse.ok) {
    return new Response(JSON.stringify({ error: 'Transcription failed' }), {
      status: 500,
    });
  }

  return new Response(flaskResponse.body, {
    headers: { 'Content-Type': 'application/json' },
  });
}