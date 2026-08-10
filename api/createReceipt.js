const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz7Uz92xx1Vhzi9VzISNpMP4nPoWfDxBB2QLUx9i0srmMk_UeuC9v7uufIW1gyGTaj-/exec";

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method === "GET") {
      return res.status(200).json({
        success: true,
        message: "Receipt API is running",
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    const response = await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8",
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (error) {
      result = {
        success: false,
        message:
          text ||
          "Invalid response from Google Apps Script",
      };
    }

    return res
      .status(
        response.ok ? 200 : response.status
      )
      .json(result);

  } catch (error) {
    console.error(
      "Receipt API error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to connect to receipt server.",
    });
  }
}

