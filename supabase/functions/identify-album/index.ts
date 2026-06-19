import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, mediaType } = await req.json() as {
      imageBase64: string
      mediaType: string
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: imageBase64 },
              },
              {
                type: 'text',
                text: 'Esta es la tapa de un disco de vinilo. Respondé SOLO con el nombre del álbum, sin artista, sin explicaciones, sin comillas. Si no podés identificarlo, respondé exactamente: ?',
              },
            ],
          },
        ],
      }),
    })

    const json = await response.json()
    const name = (json.content?.[0]?.text ?? '?').trim()

    return new Response(JSON.stringify({ name }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  }
})
