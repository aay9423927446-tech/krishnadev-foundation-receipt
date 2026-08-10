// ============================================================
// electron/database.js
// ============================================================

import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

// ============================================================
// DATABASE
// ============================================================

let database = null;

// ============================================================
// GET DATABASE
// ============================================================

export function getDB() {
  if (database) {
    return database;
  }

  const dbPath = path.join(
    app.getPath("userData"),
    "receipts.db"
  );

  console.log("DATABASE PATH:", dbPath);

  database = new Database(dbPath);

  database.pragma("journal_mode = WAL");

  // ==========================================================
  // CREATE TABLE
  // ==========================================================

  database.exec(`
    CREATE TABLE IF NOT EXISTS receipts (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      receipt_number INTEGER,

      date TEXT,

      donor_name TEXT,

      amount REAL,

      amount_words TEXT,

      payment_mode TEXT,

      transaction_number TEXT,

      transaction_date TEXT,

      towards TEXT,

      address TEXT,

      contact TEXT,

      pan TEXT,

      aadhaar TEXT,

      email TEXT,

      sync_status TEXT DEFAULT 'PENDING',

      synced_at TEXT,

      created_at TEXT
    )
  `);

  // ==========================================================
  // MIGRATE OLD DATABASES
  // ==========================================================

  const columns = database
    .prepare(`PRAGMA table_info(receipts)`)
    .all()
    .map(column => column.name);

  const requiredColumns = [
    ["synced_at", "TEXT"],
    ["sync_status", "TEXT DEFAULT 'PENDING'"],
    ["created_at", "TEXT"]
  ];

  for (const [column, type] of requiredColumns) {
    if (!columns.includes(column)) {
      try {
        database.exec(`
          ALTER TABLE receipts
          ADD COLUMN ${column} ${type}
        `);

        console.log(
          `DATABASE: added missing column ${column}`
        );
      } catch (error) {
        console.error(
          `DATABASE: could not add ${column}:`,
          error
        );
      }
    }
  }

  return database;
}

// ============================================================
// NORMALIZE RECEIPT
// ============================================================

function normalizeReceipt(receipt = {}) {
  return {
    receipt_number:
      Number(receipt.receipt_number),

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
      receipt.sync_status ?? "PENDING",

    synced_at:
      receipt.synced_at ?? "",

    created_at:
      receipt.created_at ??
      new Date().toISOString()
  };
}

// ============================================================
// CREATE RECEIPT
// ============================================================

export function createReceipt(receipt) {
  const db = getDB();

  const normalized =
    normalizeReceipt(receipt);

  if (
    !Number.isFinite(
      normalized.receipt_number
    )
  ) {
    throw new Error(
      "Invalid receipt number."
    );
  }

  const stmt = db.prepare(`
    INSERT INTO receipts (

      receipt_number,
      date,
      donor_name,
      amount,
      amount_words,
      payment_mode,
      transaction_number,
      transaction_date,
      towards,
      address,
      contact,
      pan,
      aadhaar,
      email,
      sync_status,
      synced_at,
      created_at

    )

    VALUES (

      @receipt_number,
      @date,
      @donor_name,
      @amount,
      @amount_words,
      @payment_mode,
      @transaction_number,
      @transaction_date,
      @towards,
      @address,
      @contact,
      @pan,
      @aadhaar,
      @email,
      @sync_status,
      @synced_at,
      @created_at

    )
  `);

  const result =
    stmt.run(normalized);

  return {
    id:
      result.lastInsertRowid,

    ...normalized
  };
}

// ============================================================
// GET ALL LOCAL RECEIPTS
// ============================================================

export function getReceipts() {
  const db = getDB();

  const rows = db
    .prepare(`
      SELECT *
      FROM receipts
      ORDER BY receipt_number DESC
    `)
    .all();

  return rows;
}

// ============================================================
// GET ONE LOCAL RECEIPT BY ID
// ============================================================

export function getReceipt(id) {
  const db = getDB();

  return db
    .prepare(`
      SELECT *
      FROM receipts
      WHERE id = ?
    `)
    .get(id);
}

// ============================================================
// GET RECEIPT BY RECEIPT NUMBER
// ============================================================

export function getReceiptByNumber(
  receiptNumber
) {
  const db = getDB();

  return db
    .prepare(`
      SELECT *
      FROM receipts
      WHERE receipt_number = ?
      ORDER BY id DESC
      LIMIT 1
    `)
    .get(
      Number(receiptNumber)
    );
}

// ============================================================
// GET PENDING RECEIPTS
// ============================================================

export function getPendingReceipts() {
  const db = getDB();

  return db
    .prepare(`
      SELECT *
      FROM receipts
      WHERE
        sync_status IS NULL
        OR sync_status != 'SYNCED'
      ORDER BY id ASC
    `)
    .all();
}

// ============================================================
// UPDATE SYNC STATUS
// ============================================================

export function updateSyncStatus(
  id,
  status
) {
  const db = getDB();

  const syncedAt =
    status === "SYNCED"
      ? new Date().toISOString()
      : null;

  const result = db
    .prepare(`
      UPDATE receipts

      SET
        sync_status = ?,
        synced_at = ?

      WHERE id = ?
    `)
    .run(
      status,
      syncedAt,
      id
    );

  return {
    success:
      result.changes > 0
  };
}

// ============================================================
// IMPORT / UPSERT RECEIPT FROM GOOGLE SHEETS
// ============================================================

export function importReceiptFromCloud(
  receipt
) {
  const db = getDB();

  const normalized =
    normalizeReceipt({
      ...receipt,
      sync_status: "SYNCED"
    });

  const existing =
    getReceiptByNumber(
      normalized.receipt_number
    );

  // ==========================================================
  // UPDATE EXISTING LOCAL RECEIPT
  // ==========================================================

  if (existing) {
    const stmt = db.prepare(`
      UPDATE receipts

      SET

        date = @date,
        donor_name = @donor_name,
        amount = @amount,
        amount_words = @amount_words,
        payment_mode = @payment_mode,
        transaction_number = @transaction_number,
        transaction_date = @transaction_date,
        towards = @towards,
        address = @address,
        contact = @contact,
        pan = @pan,
        aadhaar = @aadhaar,
        email = @email,
        sync_status = 'SYNCED',
        synced_at = @synced_at,
        created_at = @created_at

      WHERE receipt_number =
        @receipt_number
    `);

    stmt.run({
      ...normalized,
      synced_at:
        new Date().toISOString()
    });

    return {
      id:
        existing.id,

      ...normalized,

      sync_status:
        "SYNCED"
    };
  }

  // ==========================================================
  // INSERT NEW CLOUD RECEIPT
  // ==========================================================

  const stmt = db.prepare(`
    INSERT INTO receipts (

      receipt_number,
      date,
      donor_name,
      amount,
      amount_words,
      payment_mode,
      transaction_number,
      transaction_date,
      towards,
      address,
      contact,
      pan,
      aadhaar,
      email,
      sync_status,
      synced_at,
      created_at

    )

    VALUES (

      @receipt_number,
      @date,
      @donor_name,
      @amount,
      @amount_words,
      @payment_mode,
      @transaction_number,
      @transaction_date,
      @towards,
      @address,
      @contact,
      @pan,
      @aadhaar,
      @email,
      'SYNCED',
      @synced_at,
      @created_at

    )
  `);

  const result =
    stmt.run({
      ...normalized,

      synced_at:
        new Date().toISOString()
    });

  return {
    id:
      result.lastInsertRowid,

    ...normalized,

    sync_status:
      "SYNCED"
  };
}

// ============================================================
// GET NEXT LOCAL RECEIPT NUMBER
// ============================================================

export function getNextReceiptNumber() {
  const db = getDB();

  const row = db
    .prepare(`
      SELECT
        MAX(receipt_number) AS max_number
      FROM receipts
    `)
    .get();

  const maxNumber =
    Number(row?.max_number) || 0;

  return maxNumber + 1;
}