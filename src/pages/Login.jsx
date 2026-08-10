import { useState } from "react";

export default function Login({ onLogin }) {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  function handleSubmit(e) {

    e.preventDefault();

    setError("");


    if (!username.trim()) {

      setError(
        "Please enter username."
      );

      return;

    }


    if (!password) {

      setError(
        "Please enter password."
      );

      return;

    }


    setLoading(true);


    /*
     * TEMPORARY LOCAL LOGIN
     *
     * We will move authentication to
     * a secure backend before production.
     */

    setTimeout(() => {

      if (
        username === "admin" &&
        password === "admin123"
      ) {

        onLogin();

      } else {

        setError(
          "Invalid username or password."
        );

      }

      setLoading(false);

    }, 300);

  }


  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">

          <div className="login-title">
            SHRI KRISHNADEV
          </div>

          <div className="login-subtitle">
            FOUNDATION
          </div>

        </div>


        <h2>
          Receipt System
        </h2>


        <p className="login-description">
          Login to access the donation
          receipt system.
        </p>


        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          <label>
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Enter username"
            autoComplete="username"
          />


          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter password"
            autoComplete="current-password"
          />


          {error && (

            <div className="login-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="primary-button login-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

      </div>

    </div>

  );

}