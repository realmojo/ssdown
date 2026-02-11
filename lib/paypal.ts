const PAYPAL_API =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const getAuthHeader = (clientId: string, clientSecret: string) => {
  // Check if btoa is available (Edge Runtime / Browser)
  if (typeof btoa === "function") {
    return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
  }
  // Fallback to Buffer (Node.js)
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
};

export async function getPaypalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("PayPal credentials missing in environment variables");
    return null;
  }

  try {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: getAuthHeader(clientId, clientSecret),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store", // Don't cache the token request
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal Token Error:", errorText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("PayPal Token Fetch Error:", error);
    return null;
  }
}

export async function createPaypalOrder(amount: string) {
  const accessToken = await getPaypalAccessToken();
  if (!accessToken) {
    throw new Error(
      "Could not get PayPal access token. Please check server configuration.",
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ssdown.app";

  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: amount },
          description: "Support SSDown Development (Donation)",
        },
      ],
      application_context: {
        brand_name: "SSDown",
        user_action: "PAY_NOW",
        return_url: `${appUrl}/donation/success`,
        cancel_url: `${appUrl}/donation/cancel`,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal Order Error:", errorText);
    throw new Error(`Failed to create order: ${response.statusText}`);
  }

  return await response.json();
}
