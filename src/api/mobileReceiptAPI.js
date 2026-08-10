// ============================================================
// MOBILE RECEIPT API
// SHRI KRISHNADEV FOUNDATION
// ============================================================

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz7Uz92xx1Vhzi9VzISNpMP4nPoWfDxBB2QLUx9i0srmMk_UeuC9v7uufIW1gyGTaj-/exec";


// ============================================================
// CREATE RECEIPT FROM MOBILE / WEB
// ============================================================

export async function createMobileReceipt(receipt) {

  try {

    const response =
      await fetch(
        GOOGLE_APPS_SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({

            action: "createReceipt",

            date:
              receipt.date || "",

            donor_name:
              receipt.donor_name || "",

            amount:
              Number(receipt.amount) || 0,

            amount_words:
              receipt.amount_words || "",

            payment_mode:
              receipt.payment_mode || "",

            transaction_number:
              receipt.transaction_number || "",

            transaction_date:
              receipt.transaction_date || "",

            towards:
              receipt.towards || "",

            address:
              receipt.address || "",

            contact:
              receipt.contact || "",

            pan:
              receipt.pan || "",

            aadhaar:
              receipt.aadhaar || "",

            email:
              receipt.email || "",

            created_at:
              new Date().toISOString()

          })

        }
      );


    if (!response.ok) {

      throw new Error(
        `Server returned ${response.status}`
      );

    }


    const result =
      await response.json();


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


// ============================================================
// API HEALTH CHECK
// ============================================================

export async function checkMobileAPI() {

  try {

    const response =
      await fetch(
        GOOGLE_APPS_SCRIPT_URL
      );


    if (!response.ok) {

      return false;

    }


    const result =
      await response.json();


    return (
      result.success === true
    );


  } catch (error) {

    console.error(
      "Mobile API health check failed:",
      error
    );

    return false;

  }

}