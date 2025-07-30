import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TransactionNotificationRequest {
  type: 'created' | 'updated' | 'deleted';
  transaction: {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    account: string;
    date: string;
  };
  userEmail: string;
  userName?: string;
  phoneNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, transaction, userEmail, userName, phoneNumber }: TransactionNotificationRequest = await req.json();

    const actionText = type === 'created' ? 'added' : type === 'updated' ? 'updated' : 'deleted';
    const amountDisplay = transaction.type === 'income' ? `+$${transaction.amount}` : `-$${transaction.amount}`;
    
    // Send email notification
    if (userEmail) {
      const emailResponse = await resend.emails.send({
        from: "Finance App <onboarding@resend.dev>",
        to: [userEmail],
        subject: `Transaction ${actionText}: ${transaction.description}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              Transaction ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}
            </h1>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #495057; margin-top: 0;">Transaction Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Description:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${transaction.description}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Amount:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; color: ${transaction.type === 'income' ? '#28a745' : '#dc3545'};">
                    ${amountDisplay}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Category:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${transaction.category}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Account:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${transaction.account}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0;">${new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
              This is an automated notification from your Finance App. 
              ${userName ? `Hello ${userName}!` : ''} Keep tracking your financial progress!
            </p>
          </div>
        `,
      });

      console.log("Email notification sent:", emailResponse);
    }

    // TODO: Add SMS notification using Twilio if phoneNumber is provided
    // For now, we'll just log it
    if (phoneNumber) {
      console.log(`SMS would be sent to ${phoneNumber}: Transaction ${actionText} - ${transaction.description} ${amountDisplay}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailSent: !!userEmail,
      smsSent: false // Will be true when SMS is implemented
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-transaction-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);