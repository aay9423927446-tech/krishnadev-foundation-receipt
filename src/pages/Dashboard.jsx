import { useEffect, useState } from "react";

export default function Dashboard() {

  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    loadReceipts();
  }, []);

  async function loadReceipts() {
    const data =
      await window.receiptAPI.getReceipts();

    setReceipts(data);
  }

  const total = receipts.reduce(
    (sum, receipt) =>
      sum + Number(receipt.amount),
    0
  );

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h2>Dashboard</h2>

          <p>
            Shri Krishnadev Foundation
          </p>
        </div>

      </div>

      <div className="stats">

        <div className="stat-card">
          <span>Total Receipts</span>
          <strong>{receipts.length}</strong>
        </div>

        <div className="stat-card">
          <span>Total Collection</span>
          <strong>
            ₹ {total.toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="stat-card">
          <span>Pending Sync</span>

          <strong>
            {
              receipts.filter(
                r => r.sync_status === "PENDING"
              ).length
            }
          </strong>

        </div>

        <div className="stat-card">
          <span>Synced</span>

          <strong>
            {
              receipts.filter(
                r => r.sync_status === "SYNCED"
              ).length
            }
          </strong>

        </div>

      </div>

    </div>
  );
}