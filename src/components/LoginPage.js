// LoginPage.js
import './LoginPage.css';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, realtimeDb } from '../firebase/config'
import Swal from 'sweetalert2';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let loginError;

      if (error == "FirebaseError: Firebase: Error (auth/wrong-password).") {
        loginError = "Wrong password provided, please try again";
      } else {
        loginError = error;
      }

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error Signing In',
        footer: `<b>${loginError}</b>`
      });
    }
  };

  return (
    <div className="login-main-container">
      <div className="login-sub-container">
        <h2>Denali</h2>
        <form onSubmit={handleLogin}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email"
            autoFocus
          />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="password"
          />
          <button type="submit" className="log-in-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;