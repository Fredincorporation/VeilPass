'use client';

import React, { useRef, useState } from 'react';
import { Smartphone, Type, QrCode, CheckCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showSuccess, showError, showInfo } = useToast();
  const [scannedCode, setScannedCode] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        showError('Camera access denied. Please enable camera permissions.');
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleScan = (code: string) => {
    if (!code) return;
    setScannedCode(code);
    setScanHistory([code, ...scanHistory.slice(0, 9)]);
    showSuccess(`Ticket verified: ${code}`);
  };

  const handleManualVerify = () => {
    if (!manualInput.trim()) {
      showError('Please enter a ticket ID');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      handleScan(manualInput);
      setManualInput('');
      setIsVerifying(false);
    }, 800);
  };

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccess('Ticket ID copied to clipboard');
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    setScannedCode('');
    showInfo('Scan history cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Ticket Scanner</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Scan or enter ticket IDs to verify authenticity</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Scanner */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="relative bg-black" style={{ aspectRatio: '4 / 3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Scanner Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 border-4 border-teal-400/50 rounded-lg shadow-lg shadow-teal-500/50" />
                  <div className="absolute top-4 left-4 text-white text-xs font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                    Active
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Position QR code within the frame for automatic scanning
                </p>
              </div>
            </div>

            {/* Scanned Result */}
            {scannedCode && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-300 dark:border-green-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-900 dark:text-green-200">Ticket Verified</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">Valid ticket detected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setScannedCode('')}
                    className="px-3 py-1 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-green-200 dark:border-green-700">
                  <code className="font-mono text-sm font-bold text-gray-900 dark:text-white break-all">{scannedCode}</code>
                  <button
                    onClick={() => handleCopyToClipboard(scannedCode)}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Manual Input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6">
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-teal-600" />
                Manual Ticket Entry
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualVerify()}
                  placeholder="Enter ticket ID (e.g., TK12345678)..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition"
                />
                <button
                  onClick={handleManualVerify}
                  disabled={isVerifying || !manualInput.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Scan History Sidebar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-600" />
                Scan History
              </h3>
              {scanHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Clear
                </button>
              )}
            </div>

            {scanHistory.length > 0 ? (
              <div className="space-y-2">
                {scanHistory.map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <code className="font-mono text-xs text-gray-600 dark:text-gray-400 truncate">
                        {code}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(code)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <Copy className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-500">No scans yet</p>
              </div>
            )}

            {/* Stats */}
            {scanHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-4">
                  <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1">Total Scanned</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{scanHistory.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
