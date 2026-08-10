import { useState } from "react";

import ReceiptForm
  from "../components/ReceiptForm";

import ReceiptPreview
  from "../components/ReceiptPreview";


export default function NewReceipt() {

  const [receipt, setReceipt] =
    useState(null);


  function handleFormChange(form) {

    setReceipt(form);

  }


  async function handleSaved(
    savedReceipt
  ) {

    setReceipt(savedReceipt);


    try {

      const result =
        await window.receiptAPI
          .generatePDF(savedReceipt);


      console.log(
        "PDF generated:",
        result
      );

    } catch (error) {

      console.error(
        "PDF generation failed:",
        error
      );

    }

  }


  return (

    <div className="page">


      <div className="page-header">

        <div>

          <h2>
            New Receipt
          </h2>

          <p>
            Create a new donation receipt
          </p>

        </div>

      </div>


      <div className="receipt-workspace">


        <div className="form-panel">

          <ReceiptForm
            onChange={handleFormChange}
            onSaved={handleSaved}
          />

        </div>


        <div className="preview-panel">

          <ReceiptPreview
            receipt={receipt}
          />

        </div>


      </div>


    </div>

  );

}