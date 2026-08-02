import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import Stripe from "npm:stripe@16.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeKey);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const {
      flight_id,
      cabin_class,
      passengers,
      passenger_name,
      passenger_email,
      passenger_phone,
    } = body;

    if (!flight_id || !cabin_class || !passengers || !passenger_name || !passenger_email) {
      return new Response(
        JSON.stringify({ error: "Missing required booking fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: flight, error: flightError } = await supabase
      .from("flights")
      .select("*, origin:airports!flights_origin_id_fkey(*), destination:airports!flights_destination_id_fkey(*)")
      .eq("id", flight_id)
      .maybeSingle();

    if (flightError || !flight) {
      return new Response(
        JSON.stringify({ error: "Flight not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let unitPrice: number;
    if (cabin_class === "business") unitPrice = Number(flight.business_price);
    else if (cabin_class === "first") unitPrice = Number(flight.first_price);
    else unitPrice = Number(flight.base_price);

    const subtotal = unitPrice * passengers;
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + taxes;

    const originLabel = flight.origin?.city || flight.origin?.code || "Origin";
    const destLabel = flight.destination?.city || flight.destination?.code || "Destination";
    const cabinLabel = cabin_class === "business" ? "Business" : cabin_class === "first" ? "First Class" : "Economy";

    const siteUrl = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://example.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: passengers,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name: `${flight.airline} ${flight.flight_number} — ${originLabel} → ${destLabel}`,
              description: `${cabinLabel} class · ${flight.aircraft} · ${passengers} passenger${passengers > 1 ? "s" : ""}`,
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: taxes * 100,
            product_data: {
              name: "Taxes & fees (12%)",
            },
          },
        },
      ],
      success_url: `${siteUrl}/#/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#/payment/cancel`,
      customer_email: user.email || passenger_email,
      metadata: {
        user_id: user.id,
        flight_id,
        cabin_class,
        passengers: String(passengers),
        passenger_name,
        passenger_email,
        passenger_phone: passenger_phone || "",
        total_price: String(total),
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
