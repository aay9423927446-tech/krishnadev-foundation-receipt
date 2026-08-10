// ============================================================
// electron/preload.js
// ============================================================

const {
  contextBridge,
  ipcRenderer
} = require("electron");

console.log(
  "PRELOAD: script loaded"
);

// ============================================================
// RECEIPT API
// ============================================================

contextBridge.exposeInMainWorld(
  "receiptAPI",
  {

    // ========================================================
    // GET NEXT RECEIPT NUMBER
    // ========================================================

    getNextReceiptNumber:
      async () => {
        console.log(
          "PRELOAD: get next receipt number"
        );

        return await ipcRenderer.invoke(
          "receipt:get-next-number"
        );
      },

    // ========================================================
    // CREATE RECEIPT
    // ========================================================

    createReceipt:
      async (
        receipt
      ) => {
        console.log(
          "PRELOAD: create receipt"
        );

        return await ipcRenderer.invoke(
          "receipt:create",
          receipt
        );
      },

    // ========================================================
    // GET ALL RECEIPTS
    // ========================================================

    getAll:
      async () => {
        console.log(
          "PRELOAD: get all receipts"
        );

        return await ipcRenderer.invoke(
          "receipt:get-all"
        );
      },

    // Alias
    getReceipts:
      async () => {
        return await ipcRenderer.invoke(
          "receipt:get-all"
        );
      },

    // ========================================================
    // GET ONE RECEIPT
    // ========================================================

    getReceipt:
      async (
        id
      ) => {
        return await ipcRenderer.invoke(
          "receipt:get-one",
          id
        );
      },

    // ========================================================
    // GENERATE PDF
    // ========================================================

    generatePDF:
      async (
        receipt
      ) => {
        return await ipcRenderer.invoke(
          "receipt:generate-pdf",
          receipt
        );
      },

    // ========================================================
    // MANUAL SYNC
    // ========================================================

    sync:
      async () => {
        console.log(
          "PRELOAD: manual sync"
        );

        return await ipcRenderer.invoke(
          "receipt:sync"
        );
      },

    // ========================================================
    // UPDATE SYNC STATUS
    // ========================================================

    updateSyncStatus:
      async (
        id,
        status
      ) => {
        return await ipcRenderer.invoke(
          "receipt:update-sync-status",
          id,
          status
        );
      },

    // ========================================================
    // READY
    // ========================================================

    isReady: true
  }
);

console.log(
  "PRELOAD: receiptAPI exposed"
);