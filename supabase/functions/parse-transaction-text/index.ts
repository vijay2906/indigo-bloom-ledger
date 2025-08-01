import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    console.log('Parsing transaction text:', text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a financial transaction parser. Extract transaction details from natural language text and return ONLY valid JSON with these fields:
            - amount (number): The transaction amount (positive number only)
            - description (string): Brief description of the transaction
            - category (string): One of: Food, Transportation, Entertainment, Shopping, Healthcare, Bills, Salary, Business, Investment, Other
            - type (string): Either "income" or "expense"
            
            Examples:
            "I spent 25 dollars on lunch at McDonald's" → {"amount": 25, "description": "Lunch at McDonald's", "category": "Food", "type": "expense"}
            "Received 3000 salary payment" → {"amount": 3000, "description": "Salary payment", "category": "Salary", "type": "income"}
            "Paid 50 for gas" → {"amount": 50, "description": "Gas", "category": "Transportation", "type": "expense"}
            
            If you cannot determine a field, omit it from the JSON. Return only the JSON object, no other text.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Fallback: try to extract basic info using regex
      const amountMatch = text.match(/(\d+(?:\.\d{2})?)/);
      parsedData = {
        amount: amountMatch ? parseFloat(amountMatch[1]) : undefined,
        description: text.substring(0, 100),
        type: text.toLowerCase().includes('received') || text.toLowerCase().includes('earned') ? 'income' : 'expense'
      };
    }

    console.log('Parsed transaction data:', parsedData);

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-transaction-text function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});