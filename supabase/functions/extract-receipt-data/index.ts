import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to extract receipt data');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const { image } = await req.json();

    if (!image) {
      console.error('No image data provided in request');
      throw new Error('No image data provided');
    }

    console.log('Processing receipt image with OpenAI Vision...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a receipt data extraction assistant. Extract information from receipt images and return it as JSON with this exact structure:
{
  "merchant_name": "string",
  "total_amount": number,
  "transaction_date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number
    }
  ]
}

If any field cannot be determined, use null. For dates, convert to YYYY-MM-DD format. For amounts, extract only the numeric value.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract the receipt data from this image and return it in the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }
    
    const extractedText = data.choices[0].message.content;
    console.log('Raw extraction result:', extractedText);

    // Parse the JSON response
    let receiptData;
    try {
      receiptData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Try to extract JSON from the response if it's wrapped in markdown or other text
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receiptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse receipt data');
      }
    }

    console.log('Extracted receipt data:', receiptData);

    return new Response(JSON.stringify({ receiptData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-receipt-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});