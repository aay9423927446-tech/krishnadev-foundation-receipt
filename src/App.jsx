import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import NewReceipt from "./pages/NewReceipt";
import ReceiptHistory from "./pages/ReceiptHistory";
import Login from "./pages/Login";


export default function App() {

  const [loggedIn, setLoggedIn] =
    useState(() => {

      return (
        sessionStorage.getItem(
          "receipt_logged_in"
        ) === "true"
      );

    });


  const [page, setPage] =
    useState("dashboard");


  function handleLogin() {

    sessionStorage.setItem(
      "receipt_logged_in",
      "true"
    );

    setLoggedIn(true);

  }


  function handleLogout() {

    sessionStorage.removeItem(
      "receipt_logged_in"
    );

    setLoggedIn(false);

    setPage("dashboard");

  }


  /*
   * LOGIN
   */

  if (!loggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }


  /*
   * APPLICATION
   */

  return (

    <div className="app-layout">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-title">
            SHREE KRISHNADEV
          </div>

          <div className="brand-subtitle">
            FOUNDATION
          </div>

        </div>


        <button
          className={
            page === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("dashboard")
          }
        >
          Dashboard
        </button>


        <button
          className={
            page === "new"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("new")
          }
        >
          + New Receipt
        </button>


        <button
          className={
            page === "history"
              ? "active"
              : ""
          }
          onClick={() =>
            setPage("history")
          }
        >
          Receipt History
        </button>


        <div className="sidebar-bottom">

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>


      <main className="main">

        {page === "dashboard" && (
          <Dashboard />
        )}


        {page === "new" && (
          <NewReceipt />
        )}


        {page === "history" && (
          <ReceiptHistory />
        )}

      </main>

    </div>

  );

}