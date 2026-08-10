import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

export default function ReceiptHistory() {

  const [receipts, setReceipts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ==========================================================
  // REMOVE DUPLICATES
  // ==========================================================

  const removeDuplicates =
    useCallback(
      (list = []) => {

        const map =
          new Map();

        for (
          const receipt
          of list
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

          const existing =
            map.get(number);

          // --------------------------------------------------
          // FIRST RECORD
          // --------------------------------------------------

          if (!existing) {

            map.set(
              number,
              {
                ...receipt,

                receipt_number:
                  number
              }
            );

            continue;
          }

          // --------------------------------------------------
          // MERGE
          // --------------------------------------------------

          const merged = {
            ...existing
          };

          for (
            const [key, value]
            of Object.entries(
              receipt
            )
          ) {

            if (
              value !== undefined &&
              value !== null &&
              value !== ""
            ) {
              merged[key] =
                value;
            }
          }

          merged.receipt_number =
            number;

          // Online/SYNCED wins
          if (
            receipt.sync_status ===
            "SYNCED"
          ) {
            merged.sync_status =
              "SYNCED";
          }

          map.set(
            number,
            merged
          );
        }

        return Array.from(
          map.values()
        ).sort(
          (a, b) =>
            Number(
              b.receipt_number
            ) -
            Number(
              a.receipt_number
            )
        );
      },
      []
    );

  // ==========================================================
  // LOAD RECEIPTS
  // ==========================================================

  const loadReceipts =
    useCallback(
      async (
        showRefresh = false
      ) => {

        try {

          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          if (
            !window.receiptAPI
          ) {
            throw new Error(
              "Receipt API is not available."
            );
          }

          if (
            typeof window
              .receiptAPI
              .getAll !==
            "function"
          ) {
            throw new Error(
              "Receipt API getAll() is not available."
            );
          }

          // ==================================================
          // GET LOCAL + ONLINE FROM ELECTRON
          // ==================================================

          const result =
            await window.receiptAPI
              .getAll();

          console.log(
            "RECEIPT HISTORY:",
            result
          );

          if (
            Array.isArray(result)
          ) {

            setReceipts(
              removeDuplicates(
                result
              )
            );

          } else {

            setReceipts([]);
          }

        } catch (err) {

          console.error(
            "Could not load receipt history:",
            err
          );

          setError(
            err.message ||
            "Unable to load receipt history."
          );

        } finally {

          setLoading(false);
          setRefreshing(false);
        }

      },
      [removeDuplicates]
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredReceipts =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return receipts;
      }

      return receipts.filter(
        receipt => {

          const values = [

            receipt.receipt_number,

            receipt.date,

            receipt.donor_name,

            receipt.amount,

            receipt.payment_mode,

            receipt.transaction_number,

            receipt.towards,

            receipt.address,

            receipt.contact,

            receipt.pan,

            receipt.aadhaar,

            receipt.email,

            receipt.sync_status

          ];

          return values.some(
            value =>
              String(
                value ?? ""
              )
                .toLowerCase()
                .includes(query)
          );
        }
      );

    }, [
      receipts,
      search
    ]);

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(
    value
  ) {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  }

  // ==========================================================
  // FORMAT DATE + TIME
  // ==========================================================

  function formatDateTime(
    value
  ) {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  // ==========================================================
  // FORMAT AMOUNT
  // ==========================================================

  function formatAmount(
    amount
  ) {

    const number =
      Number(amount);

    if (
      !Number.isFinite(number)
    ) {
      return "₹0.00";
    }

    return number.toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
      }
    );
  }

  // ==========================================================
  // SYNC STATUS
  // ==========================================================

  function getSyncStatus(
    receipt
  ) {

    if (
      receipt.sync_status ===
      "SYNCED"
    ) {

      return {
        text: "SYNCED",
        className: "synced"
      };
    }

    return {
      text:
        receipt.sync_status ||
        "PENDING",

      className: "pending"
    };
  }

  // ==========================================================
  // PDF
  // ==========================================================

  async function handlePDF(
    receipt
  ) {

    try {

      if (
        !window.receiptAPI ||
        !window.receiptAPI
          .generatePDF
      ) {

        alert(
          "PDF API is not available."
        );

        return;
      }

      const result =
        await window.receiptAPI
          .generatePDF(
            receipt
          );

      if (
        result &&
        result.success
      ) {

        alert(
          `Receipt ${receipt.receipt_number} PDF saved successfully.`
        );

      } else {

        alert(
          "Unable to generate PDF."
        );
      }

    } catch (error) {

      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "Unable to generate PDF."
      );
    }
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="receipt-history">

        <div className="history-header">

          <div>

            <h1>
              Receipt History
            </h1>

            <p>
              Loading receipts...
            </p>

          </div>

        </div>

        <div className="history-loading">
          Loading...
        </div>

      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="receipt-history">

      {/* HEADER */}

      <div className="history-header">

        <div>

          <h1>
            Receipt History
          </h1>

          <p>
            View receipts created
            from this app and online/mobile.
          </p>

        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            loadReceipts(true)
          }
          disabled={refreshing}
        >

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>

      {/* ERROR */}

      {error && (

        <div className="history-error">
          {error}
        </div>

      )}

      {/* SEARCH */}

      <div className="history-toolbar">

        <input
          type="text"
          placeholder="Search receipt, donor, amount..."
          value={search}
          onChange={
            e =>
              setSearch(
                e.target.value
              )
          }
          className="history-search"
        />

        <div className="receipt-count">

          {filteredReceipts.length}

          {" "}

          receipt
          {filteredReceipts.length !== 1
            ? "s"
            : ""}

        </div>

      </div>

      {/* EMPTY */}

      {filteredReceipts.length === 0 ? (

        <div className="history-empty">

          <h3>
            No receipts found
          </h3>

          <p>

            {search
              ? "Try a different search."
              : "No receipts have been created yet."}

          </p>

        </div>

      ) : (

        <div className="table-wrapper">

          <table className="receipt-table">

            <thead>

              <tr>

                <th>
                  Receipt No.
                </th>

                <th>
                  Date
                </th>

                <th>
                  Donor Name
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Payment Mode
                </th>

                <th>
                  Towards
                </th>

                <th>
                  Contact
                </th>

                <th>
                  Sync Status
                </th>

                <th>
                  Created At
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredReceipts.map(
                receipt => {

                  const status =
                    getSyncStatus(
                      receipt
                    );

                  return (

                    <tr
                      key={
                        `receipt-${receipt.receipt_number}`
                      }
                    >

                      <td>

                        <strong
                          className="receipt-number"
                        >

                          Receipt #

                          {String(
                            receipt.receipt_number
                          ).padStart(
                            3,
                            "0"
                          )}

                        </strong>

                      </td>

                      <td>

                        {formatDate(
                          receipt.date
                        )}

                      </td>

                      <td>

                        {receipt.donor_name ||
                          "-"}

                      </td>

                      <td>

                        {formatAmount(
                          receipt.amount
                        )}

                      </td>

                      <td>

                        {receipt.payment_mode ||
                          "-"}

                      </td>

                      <td>

                        {receipt.towards ||
                          "-"}

                      </td>

                      <td>

                        {receipt.contact ||
                          "-"}

                      </td>

                      <td>

                        <span
                          className={
                            `sync-badge ${status.className}`
                          }
                        >

                          {status.text}

                        </span>

                      </td>

                      <td>

                        {formatDateTime(
                          receipt.created_at
                        )}

                      </td>

                      <td>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handlePDF(
                              receipt
                            )
                          }
                        >

                          PDF

                        </button>

                      </td>

                    </tr>

                  );
                }
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}