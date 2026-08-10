import { BrowserWindow, app } from "electron";
import fs from "fs";
import path from "path";

// ======================================================
// GET ASSET PATH
// ======================================================

function getAssetPath(fileName) {
  const possiblePaths = [
    // Development
    path.join(app.getAppPath(), "src", "assets", fileName),

    // Packaged application
    path.join(process.resourcesPath, "assets", fileName),

    // Packaged app resources
    path.join(app.getAppPath(), "assets", fileName),

    // Electron project assets
    path.join(app.getAppPath(), "electron", "assets", fileName)
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      console.log("ASSET FOUND:", filePath);
      return filePath;
    }
  }

  console.warn(
    `ASSET NOT FOUND: ${fileName}`
  );

  return null;
}

// ======================================================
// GENERATE RECEIPT PDF
// ======================================================

export async function generateReceiptPDF(receipt) {

  let win = null;
  let tempFile = null;

  try {

    console.log(
      "=========================================="
    );

    console.log(
      "Starting PDF generation for receipt:",
      receipt?.receipt_number
    );

    console.log(
      "Application path:",
      app.getAppPath()
    );

    console.log(
      "Resources path:",
      process.resourcesPath
    );

    // ==================================================
    // VALIDATE RECEIPT
    // ==================================================

    if (!receipt) {
      throw new Error(
        "Receipt data is missing."
      );
    }

    const receiptNumber =
      receipt.receipt_number ?? "";

    if (!receiptNumber) {
      throw new Error(
        "Receipt number is missing."
      );
    }

    // ==================================================
    // CREATE HIDDEN BROWSER WINDOW
    // ==================================================

    win = new BrowserWindow({

      show: false,

      width: 1200,

      height: 900,

      webPreferences: {

        contextIsolation: true,

        nodeIntegration: false

      }

    });

    // ==================================================
    // FIND LOGO
    // ==================================================

    const logoPath =
      getAssetPath(
        "foundation-logo.png"
      );

    let logoBase64 = "";

    if (logoPath) {

      try {

        logoBase64 =
          fs
            .readFileSync(logoPath)
            .toString("base64");

      } catch (error) {

        console.warn(
          "Could not read foundation logo:",
          error
        );

      }

    }

    // ==================================================
    // FIND STAMP
    // ==================================================

    const stampPath =
      getAssetPath(
        "foundation-stamp.png"
      );

    let stampBase64 = "";

    if (stampPath) {

      try {

        stampBase64 =
          fs
            .readFileSync(stampPath)
            .toString("base64");

      } catch (error) {

        console.warn(
          "Could not read foundation stamp:",
          error
        );

      }

    }

    // ==================================================
    // LOGO HTML
    // ==================================================

    const logoHTML =
      logoBase64
        ? `
          <img
            src="data:image/png;base64,${logoBase64}"
            class="logo"
          />
        `
        : "";

    // ==================================================
    // STAMP HTML
    // ==================================================

    const stampHTML =
      stampBase64
        ? `
          <img
            src="data:image/png;base64,${stampBase64}"
            class="stamp"
          />
        `
        : "";

    // ==================================================
    // SAFE VALUES
    // ==================================================

    const date =
      receipt.date ?? "";

    const donorName =
      receipt.donor_name ?? "";

    const amount =
      receipt.amount ?? "";

    const amountWords =
      receipt.amount_words ?? "";

    const paymentMode =
      receipt.payment_mode ?? "";

    const transactionNumber =
      receipt.transaction_number ?? "";

    const transactionDate =
      receipt.transaction_date ?? "";

    const towards =
      receipt.towards ?? "";

    const address =
      receipt.address ?? "";

    const contact =
      receipt.contact ?? "";

    const pan =
      receipt.pan ?? "";

    const aadhaar =
      receipt.aadhaar ?? "";

    const email =
      receipt.email ?? "";

    // ==================================================
    // HTML
    // ==================================================

    const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
Receipt ${receiptNumber}
</title>

<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  padding: 30px;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  background: white;

  color: #222;

}

.receipt {

  width: 100%;

  min-height: 650px;

  border: 2px solid #222;

  padding: 30px;

  position: relative;

}

.header {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 20px;

  margin-bottom: 15px;

}

.logo {

  width: 80px;

  height: 80px;

  object-fit: contain;

}

.organization {

  text-align: center;

}

.organization h1 {

  margin: 0;

  font-size: 26px;

  font-weight: bold;

}

.organization h2 {

  margin: 8px 0 0 0;

  font-size: 20px;

}

.top-info {

  display: flex;

  justify-content: space-between;

  margin-top: 20px;

  margin-bottom: 20px;

  font-size: 15px;

}

.row {

  display: flex;

  width: 100%;

  margin-bottom: 10px;

}

.label {

  width: 230px;

  font-weight: bold;

}

.value {

  flex: 1;

  border-bottom: 1px solid #999;

  min-height: 22px;

}

.amount-box {

  margin-top: 15px;

  margin-bottom: 15px;

  padding: 12px;

  border: 1px solid #444;

  font-size: 18px;

  font-weight: bold;

}

.thanks {

  margin-top: 20px;

  font-size: 15px;

}

.signature-section {

  position: absolute;

  bottom: 30px;

  right: 40px;

  text-align: center;

  min-width: 180px;

}

.stamp {

  width: 90px;

  height: 90px;

  object-fit: contain;

  margin-bottom: 5px;

}

.signature {

  border-top: 1px solid #222;

  padding-top: 5px;

}

.small {

  margin-top: 25px;

  font-size: 13px;

}

</style>

</head>

<body>

<div class="receipt">

  <div class="header">

    ${logoHTML}

    <div class="organization">

      <h1>
        SHREE KRISHNADEV FOUNDATION
      </h1>

      <h2>
        Donation Receipt
      </h2>

    </div>

  </div>

  <div class="top-info">

    <div>

      <strong>
        Receipt No.:
      </strong>

      ${receiptNumber}

    </div>

    <div>

      <strong>
        Date:
      </strong>

      ${date}

    </div>

  </div>

  <div class="row">

    <div class="label">
      Received With Thanks From
    </div>

    <div class="value">
      ${donorName}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Amount
    </div>

    <div class="value">
      ₹ ${amount}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Amount in Words
    </div>

    <div class="value">
      ${amountWords}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Payment Mode
    </div>

    <div class="value">
      ${paymentMode}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Cheque / Transaction No.
    </div>

    <div class="value">
      ${transactionNumber}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Transaction Date
    </div>

    <div class="value">
      ${transactionDate}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Towards
    </div>

    <div class="value">
      ${towards}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Address
    </div>

    <div class="value">
      ${address}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Contact No.
    </div>

    <div class="value">
      ${contact}
    </div>

  </div>

  <div class="row">

    <div class="label">
      PAN No.
    </div>

    <div class="value">
      ${pan}
    </div>

  </div>

  <div class="row">

    <div class="label">
      Aadhaar No.
    </div>

    <div class="value">
      ${aadhaar}
    </div>

  </div>

  <div class="row">

    <div class="label">
      E-mail
    </div>

    <div class="value">
      ${email}
    </div>

  </div>

  <div class="amount-box">

    Donation Amount:

    ₹ ${amount}

  </div>

  <div class="thanks">

    Thank you for your valuable contribution.

  </div>

  <div class="signature-section">

    ${stampHTML}

    <div class="signature">

      Authorized Signatory

    </div>

  </div>

</div>

</body>

</html>
`;

    // ==================================================
    // TEMPORARY HTML FILE
    // ==================================================

    tempFile = path.join(

      app.getPath("temp"),

      `receipt-${receiptNumber}-${Date.now()}.html`

    );

    fs.writeFileSync(

      tempFile,

      html,

      "utf8"

    );

    console.log(
      "Temporary HTML:",
      tempFile
    );

    // ==================================================
    // LOAD HTML
    // ==================================================

    await win.loadFile(
      tempFile
    );

    console.log(
      "Receipt HTML loaded."
    );

    // ==================================================
    // WAIT FOR PAGE
    // ==================================================

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          300
        )
    );

    // ==================================================
    // GENERATE PDF
    // ==================================================

    const pdf =
  await win.webContents.printToPDF({
    printBackground: true,
    landscape: false,
    pageSize: "A4",
    margins: {
      marginType: "none"
    }
  });

    console.log(
      "PDF generated successfully."
    );

    // ==================================================
    // OUTPUT DIRECTORY
    // ==================================================

    const outputDir =
      path.join(

        app.getPath("home"),

        "shrikrishnadev-receipt",

        "Receipt pdfs"

      );

    console.log(
      "PDF output directory:",
      outputDir
    );

    // ==================================================
    // CREATE DIRECTORY
    // ==================================================

    fs.mkdirSync(

      outputDir,

      {
        recursive: true
      }

    );

    // ==================================================
    // OUTPUT FILE
    // ==================================================

    const outputPath =
      path.join(

        outputDir,

        `Receipt-${receiptNumber}.pdf`

      );

    console.log(
      "Saving PDF to:",
      outputPath
    );

    // ==================================================
    // SAVE PDF
    // ==================================================

    fs.writeFileSync(

      outputPath,

      pdf

    );

    console.log(
      "PDF saved successfully:",
      outputPath
    );

    // ==================================================
    // CLEANUP WINDOW
    // ==================================================

    if (win) {

      win.close();

      win = null;

    }

    // ==================================================
    // CLEANUP TEMP FILE
    // ==================================================

    if (

      tempFile &&

      fs.existsSync(
        tempFile
      )

    ) {

      fs.unlinkSync(
        tempFile
      );

    }

    console.log(
      "PDF generation completed."
    );

    console.log(
      "=========================================="
    );

    // ==================================================
    // RETURN
    // ==================================================

    return {

      success: true,

      path: outputPath

    };

  } catch (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "PDF GENERATION ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "=========================================="
    );

    // ==================================================
    // CLEANUP WINDOW
    // ==================================================

    if (win) {

      try {

        win.close();

      } catch (closeError) {

        console.error(
          "Could not close PDF window:",
          closeError
        );

      }

    }

    // ==================================================
    // CLEANUP TEMP FILE
    // ==================================================

    if (

      tempFile &&

      fs.existsSync(
        tempFile
      )

    ) {

      try {

        fs.unlinkSync(
          tempFile
        );

      } catch (fileError) {

        console.error(
          "Could not remove temporary HTML:",
          fileError
        );

      }

    }

    throw error;

  }

}