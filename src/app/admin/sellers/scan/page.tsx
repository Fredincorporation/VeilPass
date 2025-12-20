'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Smartphone, Type, QrCode, CheckCircle, AlertCircle, RefreshCw, Copy, Scan } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { parseQRPayload, decryptTicketQR } from '@/lib/ticketQREncryption';
import axios from 'axios';

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showSuccess, showError, showInfo } = useToast();
  const [scannedCode, setScannedCode] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannerAddress, setScannerAddress] = useState('');
  const [lastScanResult, setLastScanResult] = useState<any>(null);

  useEffect(() => {
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

  const handleScan = async (qrPayload: string) => {
    if (!qrPayload || !scannerAddress) {
      showError('Please provide scanner address first');
      return;
    }

    setIsVerifying(true);

    try {
      // Parse the QR payload
      let qrData;
      try {
        qrData = parseQRPayload(qrPayload);
      } catch {
        showError('Invalid QR code format');
        setIsVerifying(false);
        return;
      }

      // Send to scanner API for verification
      const response = await axios.post('/api/admin/scan-ticket', {
        qrData,
        scannerAddress,
        scannerRole: 'event_scanner',
      });

      const result = response.data;

      if (result.valid) {
        showSuccess(`✓ Ticket verified: ${result.data?.ticketId.slice(0, 16)}...`);
        setScannedCode(qrPayload);
        setLastScanResult(result);
        setScanHistory([result, ...scanHistory.slice(0, 9)]);
      } else {
        if (result.error?.includes('already scanned')) {
          showInfo('⚠ This ticket was already scanned');
        } else if (result.error?.includes('expired')) {
          showError('❌ QR code has expired');
        } else {
          showError(`❌ ${result.error || 'Invalid ticket'}`);
        }
        setLastScanResult(result);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Verification failed';
      showError(errorMsg);
      setLastScanResult({
        valid: false,
        error: errorMsg,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualInput.trim()) {
      showError('Please paste QR data or enter ticket information');
      return;
    }
    
    await handleScan(manualInput);
    setManualInput('');
  };

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    showSuccess('Ticket ID copied to clipboard');
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    setScannedCode('');
    setLastScanResult(null);
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
            {/* Scanner Address Setup */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6">
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-3 block">
                Scanner Wallet Address
              </label>
              <input
                type="text"
                value={scannerAddress}
                onChange={(e) => setScannerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This address will be logged as the ticket scanner
              </p>
            </div>

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
            {lastScanResult && (
              <div className={`rounded-2xl border-2 p-6 ${
                lastScanResult.valid
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      lastScanResult.valid ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {lastScanResult.valid ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-bold ${
                        lastScanResult.valid
                          ? 'text-green-900 dark:text-green-200'
                          : 'text-red-900 dark:text-red-200'
                      }`}>
                        {lastScanResult.valid ? 'Ticket Verified ✓' : 'Verification Failed'}
                      </h3>
                      <p className={`text-sm ${
                        lastScanResult.valid
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {lastScanResult.message || lastScanResult.error}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setScannedCode('');
                      setLastScanResult(null);
                    }}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      lastScanResult.valid
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Clear
                  </button>
                </div>

                {lastScanResult.data && (
                  <div className="space-y-2 text-sm bg-white dark:bg-gray-900/50 p-4 rounded-lg">
                    <p>
                      <span className="font-semibold">Ticket ID:</span>{' '}
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {lastScanResult.data.ticketId.slice(0, 16)}...
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Event:</span> Event #{lastScanResult.data.eventId}
                    </p>
                    <p>
                      <span className="font-semibold">Section:</span> {lastScanResult.data.section}
                    </p>
                    <p>
                      <span className="font-semibold">Owner:</span>{' '}
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {lastScanResult.data.owner.slice(0, 10)}...
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Price:</span> {lastScanResult.data.price} ETH
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Manual Input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6">
              <label className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-teal-600" />
                Paste or Input Encrypted QR Data
              </label>
              <div className="flex gap-3 flex-col">
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder='Paste QR JSON data here... (e.g., {"encrypted":"...","hmac":"...","timestamp":...,"expiresAt":...})'
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition font-mono"
                  rows={3}
                />
                <button
                  onClick={handleManualVerify}
                  disabled={isVerifying || !manualInput.trim() || !scannerAddress}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Verify Ticket
                    </>
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
                {scanHistory.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between gap-2 p-3 rounded-lg transition group ${
                      result.valid
                        ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
                        : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      )}
                      <code className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
                        {result.data?.ticketId.slice(0, 16) || 'Invalid'} - Event #{result.data?.eventId}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(`${result.data?.ticketId || ''} - Event #${result.data?.eventId || ''}`)}
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
