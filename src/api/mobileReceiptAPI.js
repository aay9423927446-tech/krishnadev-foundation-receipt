const RECEIPT_API_URL = "/api/createReceipt";

export async function createMobileReceipt(receipt) {
  try {
    const response = await fetch(RECEIPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "createReceipt",
        date: receipt.date || "",
        donor_name: receipt.donor_name || "",
        amount: Number(receipt.amount) || 0,
        amount_words: receipt.amount_words || "",
        payment_mode: receipt.payment_mode || "",
        transaction_number: receipt.transaction_number || "",
        transaction_date: receipt.transaction_date || "",
        towards: receipt.towards || "",
        address: receipt.address || "",
        contact: receipt.contact || "",
        pan: receipt.pan || "",
        aadhaar: receipt.aadhaar || "",
        email: receipt.email || "",
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Server returned status " + response.status
      );
    }

    const result = await response.json();

    console.log(
      "Mobile receipt API response:",
      result
    );

    if (!result.success) {
      throw new Error(
        result.message ||
        "Unable to create receipt."
      );
    }

    return result;

  } catch (error) {
    console.error(
      "Mobile receipt API error:",
      error
    );

    throw error;
  }
}

export async function checkMobileAPI() {
  try {
    const response = await fetch(
      RECEIPT_API_URL
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();

    return result.success === true;

  } catch (error) {
    console.error(
      "Mobile API health check failed:",
      error
    );

    return false;
  }
}

