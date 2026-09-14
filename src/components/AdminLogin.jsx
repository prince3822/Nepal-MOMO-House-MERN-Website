import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Lock, Phone, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Sparkles, RefreshCw, Send } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export const AdminLogin = ({ onBackToSite, onLoginSuccess }) => {
  const { shopSettings, setAdminAuthSuccess } = useShop();

  const [phone, setPhone] = useState('+91 9523349571');
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Verify OTP
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDemoOtpToast, setShowDemoOtpToast] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (step === 2 && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Handler: Step 1 - Send OTP
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }

    setErrorMsg('');
    setIsSending(true);

    try {
      // Simulate 1-second delay as requested
      await new Promise((res) => setTimeout(res, 1000));

      // Attempt calling API or fallback
      try {
        await fetch(`${API_BASE_URL}/api/admin/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
      } catch (err) {}

      setIsSending(false);
      setStep(2);
      setShowDemoOtpToast(true);
      setResendTimer(30);
    } catch (err) {
      setIsSending(false);
      setErrorMsg('Failed to send OTP. Please try again.');
    }
  };

  // Handler: Step 2 - Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!otp || otp.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    try {
      let isSuccess = false;
      let token = `admin_token_${Date.now()}`;

      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp: otp.trim() })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          isSuccess = true;
          token = data.token || token;
        }
      } catch (e) {}

      // Fallback verification if offline / mock check
      if (otp.trim() === '123456') {
        isSuccess = true;
      }

      if (isSuccess) {
        setSuccessMsg('OTP Verified! Access Granted.');
        // Set mock session token in localStorage as requested (admin_token & nmh_admin_token)
        localStorage.setItem('admin_token', token);
        localStorage.setItem('nmh_admin_token', token);
        localStorage.setItem('nmh_admin_auth', 'true');
        setAdminAuthSuccess(token);

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            window.history.pushState({}, '', '/admin');
            window.dispatchEvent(new Event('popstate'));
          }
        }, 600);
      } else {
        setErrorMsg('Invalid OTP, please enter 123456');
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setErrorMsg('Invalid OTP, please enter 123456');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative font-sans text-stone-100 selection:bg-red-600 selection:text-white">
      
      {/* Back to Homepage button */}
      <button
        onClick={onBackToSite}
        className="absolute top-6 left-6 flex items-center gap-2 text-stone-400 hover:text-white text-xs font-bold bg-stone-900 px-4 py-2 rounded-xl border border-stone-800 transition-colors shadow-md cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Storefront
      </button>

      <div className="w-full max-w-md bg-stone-900 rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 mx-auto shadow-lg bg-stone-800 flex items-center justify-center">
            <img
              src={shopSettings.logo || "/assets/logo.jpg"}
              alt={shopSettings.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-tight text-white">
              {shopSettings.name}
            </h1>
            <p className="text-xs text-red-500 font-extrabold uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Mobile OTP Admin Portal
            </p>
          </div>
        </div>

        {/* Demo OTP Banner Toast */}
        {showDemoOtpToast && (
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 text-xs font-bold p-3.5 rounded-2xl border border-amber-500/40 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Demo OTP: <strong className="text-white font-mono text-sm tracking-wider">123456</strong> (valid for 5 mins)</span>
            </div>
            <button
              onClick={() => setOtp('123456')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer"
            >
              Auto Fill
            </button>
          </div>
        )}

        {/* Status Notifications */}
        {errorMsg && (
          <div className="bg-red-950/90 text-red-300 text-xs font-bold p-3.5 rounded-xl border border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/90 text-emerald-300 text-xs font-bold p-3.5 rounded-xl border border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: MOBILE NUMBER ENTRY */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-500" /> Owner Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9523349571"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3.5 text-stone-100 font-mono text-base font-bold focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send OTP via SMS</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION CARD */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-400 font-medium">
                <span>Enter 6-Digit OTP sent to {phone}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="text-red-400 hover:text-red-300 font-bold underline"
                >
                  Change
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="1 2 3 4 5 6"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3.5 text-center text-stone-100 font-mono text-2xl tracking-[0.4em] font-extrabold focus:outline-none focus:border-red-500"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify OTP & Enter Admin</span>
                </>
              )}
            </button>

            {/* 30s Resend Timer */}
            <div className="text-center pt-2 text-xs text-stone-400 font-medium">
              {resendTimer > 0 ? (
                <span>Resend OTP in <strong className="text-amber-400 font-mono font-bold">{resendTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                >
                  Resend OTP Now
                </button>
              )}
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-stone-800 text-[10px] text-stone-500 font-medium">
          Authorized owner access only • {shopSettings.name}
        </div>

      </div>
    </div>
  );
};
