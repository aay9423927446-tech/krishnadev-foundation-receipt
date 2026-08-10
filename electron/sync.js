// ============================================================
// electron/sync.js
// ============================================================

import {
  getPendingReceipts,
  updateSyncStatus
} from "./database.js";

// ============================================================
// GOOGLE APPS SCRIPT URL
// ============================================================

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz7Uz92xx1Vhzi9VzISNpMP4nPoWfDxBB2QLUx9i0srmMk_UeuC9v7uufIW1gyGTaj-/exec";

// ============================================================
// SYNC ONE RECEIPT
// ============================================================

async function syncReceipt(receipt) {
  console.log(
    "SYNC: syncing receipt:",
    receipt.receipt_number
  );

  const response =
    await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          action:
            "syncReceipt",

          receipt_number:
            receipt.receipt_number,

          date:
            receipt.date,

          donor_name:
            receipt.donor_name,

          amount:
            receipt.amount,

          amount_words:
            receipt.amount_words,

          payment_mode:
            receipt.payment_mode,

          transaction_number:
            receipt.transaction_number,

          transaction_date:
            receipt.transaction_date,

          towards:
            receipt.towards,

          address:
            receipt.address,

          contact:
            receipt.contact,

          pan:
            receipt.pan,

          aadhaar:
            receipt.aadhaar,

          email:
            receipt.email,

          created_at:
            receipt.created_at
        })
      }
    );

  if (!response.ok) {
    throw new Error(
      `Google Apps Script returned HTTP ${response.status}`
    );
  }

  const result =
    await response.json();

  console.log(
    "SYNC: Google response:",
    result
  );

  if (!result.success) {
    throw new Error(
      result.message ||
      "Google Apps Script sync failed."
    );
  }

  return result;
}

// ============================================================
// GET CENTRAL RECEIPT NUMBER
// ============================================================

export async function getCentralReceiptNumber() {
  console.log(
    "SYNC: requesting central receipt number..."
  );

  const url =
    `${GOOGLE_APPS_SCRIPT_URL}?action=getNextReceiptNumber`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Google Apps Script returned HTTP ${response.status}`
    );
  }

  const result =
    await response.json();

  console.log(
    "SYNC: central number response:",
    result
  );

  if (!result.success) {
    throw new Error(
      result.message ||
      "Could not get receipt number."
    );
  }

  if (
    result.receipt_number ===
      undefined ||
    result.receipt_number === null
  ) {
    throw new Error(
      "Google Apps Script did not return a receipt number."
    );
  }

  return Number(
    result.receipt_number
  );
}

// ============================================================
// GET ALL ONLINE RECEIPTS
// ============================================================

export async function getOnlineReceipts() {
  console.log(
    "SYNC: fetching online receipts..."
  );

  const url =
    `${GOOGLE_APPS_SCRIPT_URL}?action=getReceipts`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Google Apps Script returned HTTP ${response.status}`
    );
  }

  const result =
    await response.json();

  console.log(
    "SYNC: online response:",
    result
  );

  if (!result.success) {
    throw new Error(
      result.message ||
      "Could not fetch online receipts."
    );
  }

  if (
    !Array.isArray(
      result.receipts
    )
  ) {
    return [];
  }

  return result.receipts.map(
    normalizeOnlineReceipt
  );
}

// ============================================================
// NORMALIZE ONLINE RECEIPT
// ============================================================

function normalizeOnlineReceipt(
  receipt
) {
  return {
    id:
      receipt.id ??
      `online-${receipt.receipt_number}`,

    receipt_number:
      Number(
        receipt.receipt_number
      ),

    date:
      receipt.date ?? "",

    donor_name:
      receipt.donor_name ?? "",

    amount:
      Number(receipt.amount) || 0,

    amount_words:
      receipt.amount_words ?? "",

    payment_mode:
      receipt.payment_mode ?? "",

    transaction_number:
      receipt.transaction_number ?? "",

    transaction_date:
      receipt.transaction_date ?? "",

    towards:
      receipt.towards ?? "",

    address:
      receipt.address ?? "",

    contact:
      receipt.contact ?? "",

    pan:
      receipt.pan ?? "",

    aadhaar:
      receipt.aadhaar ?? "",

    email:
      receipt.email ?? "",

    sync_status:
      "SYNCED",

    synced_at:
      receipt.synced_at ??
      receipt.sync_status ??
      "SYNCED",

    created_at:
      receipt.created_at ?? ""
  };
}

// ============================================================
// MERGE LOCAL + ONLINE
// ============================================================

export function mergeReceipts(
  localReceipts = [],
  onlineReceipts = []
) {
  const receiptMap =
    new Map();

  // ==========================================================
  // FIRST: LOCAL RECEIPTS
  // ==========================================================

  for (
    const receipt
    of localReceipts
  ) {
    const number =
      Number(
        receipt.receipt_number
      );

    if (
      !Number.isFinite(number)
    ) {
      continue;
    }

    receiptMap.set(
      number,
      {
        ...receipt,

        receipt_number:
          number
      }
    );
  }

  // ==========================================================
  // SECOND: ONLINE RECEIPTS
  // ==========================================================

  for (
    const online
    of onlineReceipts
  ) {
    const normalized =
      normalizeOnlineReceipt(
        online
      );

    const number =
      Number(
        normalized.receipt_number
      );

    if (
      !Number.isFinite(number)
    ) {
      continue;
    }

    const existing =
      receiptMap.get(number);

    // ========================================================
    // SAME RECEIPT EXISTS LOCALLY
    // ========================================================

    if (existing) {
      receiptMap.set(
        number,
        {
          ...existing,

          ...normalized,

          // Preserve local database ID
          id:
            existing.id ??
            normalized.id,

          // ONLINE COPY CONFIRMS SYNC
          sync_status:
            "SYNCED"
        }
      );
    }

    // ========================================================
    // ONLINE-ONLY RECEIPT
    // ========================================================

    else {
      receiptMap.set(
        number,
        normalized
      );
    }
  }

  // ==========================================================
  // RETURN NEWEST RECEIPTS FIRST
  // ==========================================================

  return Array.from(
    receiptMap.values()
  ).sort(
    (a, b) =>
      Number(
        b.receipt_number
      ) -
      Number(
        a.receipt_number
      )
  );
}

// ============================================================
// SYNC ALL PENDING LOCAL RECEIPTS
// ============================================================

export async function syncPendingReceipts() {
  console.log(
    "SYNC: checking pending receipts..."
  );

  const pending =
    getPendingReceipts();

  if (
    !pending ||
    pending.length === 0
  ) {
    console.log(
      "SYNC: nothing to sync."
    );

    return {
      success: true,
      synced: 0,
      failed: 0,
      message:
        "Nothing to sync."
    };
  }

  let synced = 0;
  let failed = 0;

  for (
    const receipt
    of pending
  ) {
    try {
      await syncReceipt(
        receipt
      );

      updateSyncStatus(
        receipt.id,
        "SYNCED"
      );

      synced++;

      console.log(
        `SYNC: receipt #${receipt.receipt_number} synced.`
      );

    } catch (error) {
      failed++;

      console.error(
        `SYNC: receipt #${receipt.receipt_number} failed:`,
        error
      );

      updateSyncStatus(
        receipt.id,
        "PENDING"
      );
    }
  }

  return {
    success:
      failed === 0,

    synced,

    failed,

    message:
      `${synced} receipt(s) synced, ${failed} failed.`
  };
}