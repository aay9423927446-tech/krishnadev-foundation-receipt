// ============================================================
// electron/main.js
// ============================================================

import {
  app,
  BrowserWindow,
  ipcMain
} from "electron";

import path from "path";
import {
  fileURLToPath
} from "url";

import isDev from
  "electron-is-dev";

// ============================================================
// DATABASE
// ============================================================

import {
  createReceipt,
  getReceipts,
  getReceipt,
  getNextReceiptNumber,
  updateSyncStatus
} from "./database.js";

// ============================================================
// SYNC
// ============================================================

import {
  getCentralReceiptNumber,
  getOnlineReceipts,
  mergeReceipts,
  syncPendingReceipts
} from "./sync.js";

// ============================================================
// PDF
// ============================================================

import {
  generateReceiptPDF
} from "./pdf.js";

// ============================================================
// PATH
// ============================================================

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

// ============================================================
// WINDOW
// ============================================================

let mainWindow = null;

// ============================================================
// CREATE WINDOW
// ============================================================

function createWindow() {
  const preloadPath =
    path.join(
      __dirname,
      "preload.js"
    );

  console.log(
    "MAIN: preload:",
    preloadPath
  );

  mainWindow =
    new BrowserWindow({
      width: 1400,
      height: 900,

      minWidth: 1100,
      minHeight: 700,

      webPreferences: {
        preload:
          preloadPath,

        contextIsolation:
          true,

        nodeIntegration:
          false
      }
    });

  if (isDev) {
    mainWindow.loadURL(
      "http://localhost:5173"
    );

    mainWindow.webContents
      .openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        "../dist/index.html"
      )
    );
  }

  mainWindow.webContents.on(
    "did-finish-load",
    () => {
      console.log(
        "MAIN: window loaded"
      );
    }
  );
}

// ============================================================
// AUTOMATIC SYNC
// ============================================================

async function automaticSync() {
  try {
    const result =
      await syncPendingReceipts();

    console.log(
      "MAIN: automatic sync:",
      result
    );
  } catch (error) {
    console.error(
      "MAIN: automatic sync failed:",
      error
    );
  }
}

// ============================================================
// APP READY
// ============================================================

app.whenReady().then(() => {
  console.log(
    "MAIN: Electron application started."
  );

  // ==========================================================
  // GET ALL RECEIPTS
  // ==========================================================

  ipcMain.handle(
    "receipt:get-all",
    async () => {
      console.log(
        "IPC: receipt:get-all"
      );

      try {
        // ----------------------------------------------------
        // FIRST SYNC LOCAL PENDING RECEIPTS
        // ----------------------------------------------------

        try {
          const syncResult =
            await syncPendingReceipts();

          console.log(
            "IPC: pending sync:",
            syncResult
          );
        } catch (error) {
          console.error(
            "IPC: pending sync failed:",
            error
          );
        }

        // ----------------------------------------------------
        // GET LOCAL RECEIPTS
        // ----------------------------------------------------

        const localReceipts =
          getReceipts();

        console.log(
          "IPC: local receipts:",
          localReceipts.map(
            r =>
              r.receipt_number
          )
        );

        // ----------------------------------------------------
        // GET ONLINE RECEIPTS
        // ----------------------------------------------------

        let onlineReceipts = [];

        try {
          onlineReceipts =
            await getOnlineReceipts();

          console.log(
            "IPC: online receipts:",
            onlineReceipts.map(
              r =>
                r.receipt_number
            )
          );

        } catch (error) {
          console.error(
            "IPC: online fetch failed:",
            error
          );
        }

        // ----------------------------------------------------
        // MERGE
        // ----------------------------------------------------

        const merged =
          mergeReceipts(
            localReceipts,
            onlineReceipts
          );

        console.log(
          "IPC: FINAL receipts:",
          merged.map(
            r =>
              r.receipt_number
          )
        );

        return merged;

      } catch (error) {
        console.error(
          "IPC: get-all failed:",
          error
        );

        return getReceipts();
      }
    }
  );

  // ==========================================================
  // GET ONE RECEIPT
  // ==========================================================

  ipcMain.handle(
    "receipt:get-one",
    async (
      _event,
      id
    ) => {
      try {
        const local =
          getReceipt(id);

        if (local) {
          return local;
        }

        const online =
          await getOnlineReceipts();

        return (
          online.find(
            receipt =>
              String(
                receipt.receipt_number
              ) ===
              String(id)
          ) || null
        );

      } catch (error) {
        console.error(
          "IPC: get-one failed:",
          error
        );

        return null;
      }
    }
  );

  // ==========================================================
  // GET NEXT RECEIPT NUMBER
  // ==========================================================

  ipcMain.handle(
    "receipt:get-next-number",
    async () => {
      try {
        const number =
          await getCentralReceiptNumber();

        console.log(
          "IPC: central next number:",
          number
        );

        return number;

      } catch (error) {
        console.error(
          "IPC: central number failed:",
          error
        );

        const localNumber =
          getNextReceiptNumber();

        console.log(
          "IPC: local fallback number:",
          localNumber
        );

        return localNumber;
      }
    }
  );

  // ==========================================================
  // CREATE RECEIPT
  // ==========================================================

  ipcMain.handle(
    "receipt:create",
    async (
      _event,
      receipt
    ) => {
      console.log(
        "IPC: creating receipt:",
        receipt
      );

      try {
        const saved =
          createReceipt(
            receipt
          );

        console.log(
          "IPC: saved:",
          saved
        );

        // ----------------------------------------------------
        // IMMEDIATE SYNC
        // ----------------------------------------------------

        try {
          const syncResult =
            await syncPendingReceipts();

          console.log(
            "IPC: immediate sync:",
            syncResult
          );

          if (
            syncResult.success &&
            syncResult.synced > 0
          ) {
            saved.sync_status =
              "SYNCED";
          }

        } catch (error) {
          console.error(
            "IPC: immediate sync failed:",
            error
          );
        }

        return saved;

      } catch (error) {
        console.error(
          "IPC: create failed:",
          error
        );

        throw error;
      }
    }
  );

  // ==========================================================
  // GENERATE PDF
  // ==========================================================

  ipcMain.handle(
    "receipt:generate-pdf",
    async (
      _event,
      receipt
    ) => {
      try {
        return await generateReceiptPDF(
          receipt
        );
      } catch (error) {
        console.error(
          "IPC: PDF error:",
          error
        );

        throw error;
      }
    }
  );

  // ==========================================================
  // MANUAL SYNC
  // ==========================================================

  ipcMain.handle(
    "receipt:sync",
    async () => {
      return await syncPendingReceipts();
    }
  );

  // ==========================================================
  // UPDATE SYNC STATUS
  // ==========================================================

  ipcMain.handle(
    "receipt:update-sync-status",
    (
      _event,
      id,
      status
    ) => {
      return updateSyncStatus(
        id,
        status
      );
    }
  );

  // ==========================================================
  // CREATE WINDOW
  // ==========================================================

  createWindow();

  // ==========================================================
  // START AUTOMATIC SYNC
  // ==========================================================

  automaticSync();

  setInterval(
    automaticSync,
    5 * 60 * 1000
  );

  // ==========================================================
  // MACOS
  // ==========================================================

  app.on(
    "activate",
    () => {
      if (
        BrowserWindow
          .getAllWindows()
          .length === 0
      ) {
        createWindow();
      }
    }
  );
});

// ============================================================
// QUIT
// ============================================================

app.on(
  "window-all-closed",
  () => {
    if (
      process.platform !==
      "darwin"
    ) {
      app.quit();
    }
  }
);