import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config'
import Swal from 'sweetalert2';

import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {

      Swal.fire({
        icon: 'error',
        title: 'Wrong credentials...'
      });
    }
  };

  return (
    <div className="login-main-container">
      <div className="login-sub-container">
        <h2>Foraker</h2>
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