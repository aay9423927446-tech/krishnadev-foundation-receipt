import { useEffect, useState } from "react";
import { numberToWords } from "../utils/numberToWords";
import { createMobileReceipt } from "../api/mobileReceiptAPI";

const initialState = {
  receipt_number: "",
  date: new Date().toISOString().split("T")[0],

  donor_name: "",
  amount: "",
  amount_words: "",

  payment_mode: "Cash",
  transaction_number: "",
  transaction_date: "",

  towards: "Donation",

  address: "",
  contact: "",
  pan: "",
  aadhaar: "",
  email: ""
};


export default function ReceiptForm({
  onSaved,
  onChange
}) {

  const [form, setForm] =
    useState(initialState);

  const [saving, setSaving] =
    useState(false);


  /*
   * Detect whether the application is running
   * inside Electron.
   *
   * Electron:
   * window.receiptAPI exists
   *
   * Chrome/mobile:
   * window.receiptAPI does not exist
   */

  const isElectron =
    typeof window !== "undefined" &&
    !!window.receiptAPI;


  /*
   * ----------------------------------------------------------
   * INITIAL FORM
   * ----------------------------------------------------------
   */

  useEffect(() => {

    /*
     * Do NOT request a receipt number when
     * the form is opened.
     *
     * The number will be assigned only when
     * Save Receipt is clicked.
     */

    const initialForm = {
      ...initialState,
      receipt_number: ""
    };

    setForm(initialForm);

    onChange?.(initialForm);

  }, []);


  /*
   * ----------------------------------------------------------
   * HANDLE INPUT
   * ----------------------------------------------------------
   */

  function handleChange(e) {

    const {
      name,
      value
    } = e.target;


    setForm((previous) => {

      const updated = {
        ...previous,
        [name]: value
      };


      /*
       * Convert amount to words
       */

      if (name === "amount") {

        updated.amount_words =
          numberToWords(value);

      }


      onChange?.(updated);

      return updated;

    });

  }


  /*
   * ----------------------------------------------------------
   * SAVE RECEIPT
   * ----------------------------------------------------------
   */

  async function handleSubmit(e) {

    e.preventDefault();


    /*
     * Validate donor
     */

    if (
      !form.donor_name.trim()
    ) {

      alert(
        "Please enter donor name."
      );

      return;

    }


    /*
     * Validate amount
     */

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {

      alert(
        "Please enter a valid amount."
      );

      return;

    }


    setSaving(true);


    try {

      let saved;


      /*
       * ======================================================
       * ELECTRON MODE
       * ======================================================
       *
       * Desktop application:
       *
       * Electron
       *    ↓
       * SQLite
       *    ↓
       * PDF
       *    ↓
       * Google Sheets
       */

      if (isElectron) {

        console.log(
          "Running in Electron mode."
        );


        /*
         * Get receipt number ONLY NOW.
         *
         * This prevents numbers being consumed
         * simply by opening the New Receipt page.
         */

        console.log(
          "Requesting receipt number..."
        );


        const receiptNumber =
          await window.receiptAPI
            .getNextReceiptNumber();


        if (
          !receiptNumber
        ) {

          throw new Error(
            "Could not get receipt number."
          );

        }


        console.log(
          "Receipt number:",
          receiptNumber
        );


        const receiptToSave = {

          ...form,

          receipt_number:
            receiptNumber,

          amount:
            Number(form.amount)

        };


        /*
         * Update preview with actual
         * receipt number.
         */

        setForm(
          receiptToSave
        );

        onChange?.(
          receiptToSave
        );


        /*
         * Save to SQLite
         */

        saved =
          await window.receiptAPI
            .createReceipt(
              receiptToSave
            );


        console.log(
          "Receipt saved locally:",
          saved
        );


        /*
         * Generate PDF
         */

        try {

          const pdfResult =
            await window.receiptAPI
              .generatePDF(
                saved
              );


          console.log(
            "PDF generated:",
            pdfResult
          );


        } catch (pdfError) {

          console.error(
            "PDF generation failed:",
            pdfError
          );

          /*
           * Receipt is already safely saved
           * even if PDF generation fails.
           */

          alert(
            `Receipt ${saved.receipt_number} was saved, but the PDF could not be generated.`
          );

        }

      }


      /*
       * ======================================================
       * CHROME / MOBILE MODE
       * ======================================================
       *
       * Mobile browser:
       *
       * Chrome
       *    ↓
       * Google Apps Script
       *    ↓
       * Google Sheets
       */

      else {

        console.log(
          "Running in Chrome/mobile mode."
        );


        /*
         * Mobile receipt does NOT request
         * a number separately.
         *
         * Apps Script assigns the number
         * atomically when creating the receipt.
         */

        saved =
          await createMobileReceipt(
            form
          );


        console.log(
          "Mobile receipt created:",
          saved
        );

      }


      /*
       * ======================================================
       * SUCCESS
       * ======================================================
       */

      onSaved?.(
        saved
      );


      alert(
        `Receipt ${saved.receipt_number} saved successfully.`
      );


      /*
       * Reset form.
       *
       * We intentionally don't request the next
       * number here.
       */

      const newForm = {

        ...initialState,

        receipt_number: ""

      };


      setForm(
        newForm
      );


      onChange?.(
        newForm
      );


    } catch (error) {

      console.error(
        "SAVE RECEIPT ERROR:",
        error
      );


      alert(
        "Unable to save receipt.\n\n" +
        (error.message ||
          "Please check your connection and try again.")
      );


    } finally {

      setSaving(false);

    }

  }


  /*
   * ----------------------------------------------------------
   * DISPLAY RECEIPT NUMBER
   * ----------------------------------------------------------
   */

  const displayedReceiptNumber =
    form.receipt_number ||
    "Will be assigned on save";


  /*
   * ----------------------------------------------------------
   * UI
   * ----------------------------------------------------------
   */

  return (

    <form
      className="receipt-form"
      onSubmit={handleSubmit}
    >

      <div className="form-grid">


        {/* ==================================================
            RECEIPT NUMBER
            ================================================== */}

        <div
          className="receipt-number-field"
        >

          <label>
            Receipt No.
          </label>


          <input
            className="receipt-number-input"
            value={
              displayedReceiptNumber
            }
            disabled
          />

        </div>


        {/* ==================================================
            DATE
            ================================================== */}

        <div>

          <label>
            Date
          </label>


          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            DONOR
            ================================================== */}

        <div className="full">

          <label>
            Received With Thanks From
          </label>


          <input
            name="donor_name"
            value={form.donor_name}
            onChange={handleChange}
            placeholder="Mr./Mrs."
            required
          />

        </div>


        {/* ==================================================
            AMOUNT
            ================================================== */}

        <div>

          <label>
            Amount
          </label>


          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />

        </div>


        {/* ==================================================
            AMOUNT WORDS
            ================================================== */}

        <div>

          <label>
            Amount in Words
          </label>


          <input
            value={
              form.amount_words
            }
            disabled
          />

        </div>


        {/* ==================================================
            PAYMENT MODE
            ================================================== */}

        <div>

          <label>
            Payment Mode
          </label>


          <select
            name="payment_mode"
            value={
              form.payment_mode
            }
            onChange={handleChange}
          >

            <option>
              Cash
            </option>

            <option>
              Draft
            </option>

            <option>
              NEFT
            </option>

            <option>
              RTGS
            </option>

            <option>
              Cheque
            </option>

            <option>
              UPI
            </option>

          </select>

        </div>


        {/* ==================================================
            TRANSACTION NUMBER
            ================================================== */}

        <div>

          <label>
            Cheque / Transaction No.
          </label>


          <input
            name="transaction_number"
            value={
              form.transaction_number
            }
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            TRANSACTION DATE
            ================================================== */}

        <div>

          <label>
            Transaction Date
          </label>


          <input
            type="date"
            name="transaction_date"
            value={
              form.transaction_date
            }
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            TOWARDS
            ================================================== */}

        <div>

          <label>
            Towards
          </label>


          <input
            name="towards"
            value={
              form.towards
            }
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            ADDRESS
            ================================================== */}

        <div className="full">

          <label>
            Address
          </label>


          <textarea
            name="address"
            value={
              form.address
            }
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            CONTACT
            ================================================== */}

        <div>

          <label>
            Contact No.
          </label>


          <input
            name="contact"
            value={
              form.contact
            }
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            PAN
            ================================================== */}

        <div>

          <label>
            PAN No.
          </label>


          <input
            name="pan"
            value={
              form.pan
            }
            onChange={handleChange}
          />

        </div>


        {/* ==================================================
            AADHAAR
            ================================================== */}

        <div>

          <label>
            Aadhaar No.
          </label>


          <input
            name="aadhaar"
            value={
              form.aadhaar
            }
            onChange={handleChange}
            maxLength="12"
          />

        </div>


        {/* ==================================================
            EMAIL
            ================================================== */}

        <div>

          <label>
            E-mail
          </label>


          <input
            type="email"
            name="email"
            value={
              form.email
            }
            onChange={handleChange}
          />

        </div>


      </div>


      {/* ====================================================
          SAVE BUTTON
          ==================================================== */}

      <button
        type="submit"
        disabled={saving}
        className="primary-button"
      >

        {saving
          ? "Saving..."
          : "Save Receipt"}

      </button>


    </form>

  );

}