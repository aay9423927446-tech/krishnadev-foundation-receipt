export default function ReceiptPreview({ receipt }) {
  if (!receipt) {
    return (
      <div className="preview-empty">
        Receipt preview will appear here.
      </div>
    );
  }

  return (
    <div className="receipt-preview">

      <div className="receipt-border">

        <header className="receipt-header">

          <img
            src="/foundation-logo.png"
            className="foundation-logo"
          />

          <div className="foundation-details">

            <h1>
              SHREE KRISHNADEV FOUNDATION
            </h1>

            <p>
              Reg. No. : 208/2018
              &nbsp;&nbsp;
              Trust Reg. No.-F-1935312A
            </p>

            <p>
              PAN No.: AAWTS4892C
            </p>

            <p>
              Flat No.05, Mangalmurti Apartment,
              Near ABB Circle, Mahatma Nagar, Nashik.
            </p>

            <p>
              E-mail :
              shrikrishnadevfoundation@gmail.com
            </p>

          </div>

        </header>

        <div className="receipt-title">
          RECEIPT
        </div>

        <div className="receipt-meta">
          <span>
            Receipt No.:
            <strong>{receipt.receipt_number}</strong>
          </span>

          <span>
            Date:
            {receipt.date}
          </span>
        </div>

        <div className="receipt-body">

          <p>
            Received with thanks from
          </p>

          <div className="receipt-line">
            {receipt.donor_name}
          </div>

          <p>
            Amount:
            <span className="value">
              ₹ {Number(receipt.amount).toLocaleString("en-IN")}
            </span>
          </p>

          <p>
            The sum of amount (In Words):
          </p>

          <div className="receipt-line">
            {receipt.amount_words}
          </div>

          <p>
            By {receipt.payment_mode}
            &nbsp;&nbsp;
            No.: {receipt.transaction_number}
            &nbsp;&nbsp;
            Date: {receipt.transaction_date}
          </p>

          <p>
            Towards:
            <span className="value">
              {receipt.towards}
            </span>
          </p>

          <p>
            Address:
            <span className="value">
              {receipt.address}
            </span>
          </p>

          <div className="two-column">

            <p>
              Contact No.:
              <span>{receipt.contact}</span>
            </p>

            <p>
              PAN No.:
              <span>{receipt.pan}</span>
            </p>

          </div>

          <div className="two-column">

            <p>
              Adhar No.:
              <span>{receipt.aadhaar}</span>
            </p>

            <p>
              E-mail:
              <span>{receipt.email}</span>
            </p>

          </div>

          <div className="signature-row">

            <div>
              Subject to encashment of cheque
            </div>

            <div>
              (Authorised Signature)
            </div>

          </div>

        </div>

        <footer>
          All Contributors for KRISHNADEV FOUNDATION
          are Exempted U/S 12(A) 80G of I.T. Act
        </footer>

      </div>

    </div>
  );
}