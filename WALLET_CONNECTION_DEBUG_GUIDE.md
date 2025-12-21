# Wallet Connection & Mobile Header - Visual Guide & Debugging

## Mobile Header Layout

### Before (No hamburger menu, items cramped)
```
[VP VeilPass] [Dashboard] [Events] [Auctions] [🔔] [🌙] [Connect] ❌ Too crowded
```

### After (Mobile - with hamburger)
```
[☰] [VP] [🔔] [🌙] [Connect]
    ↓ (click menu)
    [Dashboard]
    [Events]  
    [Auctions]
```

### After (Desktop - unchanged)
```
[VP VeilPass]     [Dashboard] [Events] [Auctions]     [🔔] [🌙] [Connect]
```

## Wallet Connection Event Flow

### Scenario 1: User Connects Wallet

```
User clicks "Connect Wallet"
    ↓
RainbowKit modal opens
    ↓
User selects wallet and approves
    ↓
RainbowKit updates useAccount() hook:
  - address: "0x..." (was undefined)
  - isConnected: true (was false)
    ↓
ConnectWallet.tsx detects state change:
  previousState: { address: undefined, isConnected: false }
  currentState: { address: "0x...", isConnected: true }
    ↓
✓ Condition met: !previousState.isConnected && isConnected && address
    ↓
  1. localStorage.setItem('veilpass_account', address)
  2. window.dispatchEvent(new Event('walletConnected'))
  3. Redirect to /dashboard after 400ms
    ↓
Other components listening to 'walletConnected':
  - Header.tsx: Updates userWallet, closes mobile menu
  - WalletGuard.tsx: Sets account, hides overlay
  - DashboardLayout.tsx: Sets account, no need to show connect prompt
```

**Console Output:**
```
[ConnectWallet] Wallet connected: 0x1234...5678
```

---

### Scenario 2: User Disconnects Wallet

```
User clicks disconnect in wallet extension
    ↓
RainbowKit updates useAccount() hook:
  - address: undefined (was "0x...")
  - isConnected: false (was true)
    ↓
ConnectWallet.tsx detects state change:
  previousState: { address: "0x...", isConnected: true }
  currentState: { address: undefined, isConnected: false }
    ↓
✓ Condition met: previousState.isConnected && !isConnected
    ↓
  1. localStorage.removeItem('veilpass_account')
  2. window.dispatchEvent(new Event('walletDisconnected'))
    ↓
Other components listening to 'walletDisconnected':
  - Header.tsx: Clears userWallet, closes mobile menu
  - WalletGuard.tsx: Sets account to null, shows overlay on protected pages
  - DashboardLayout.tsx: Redirects to connect screen
```

**Console Output:**
```
[ConnectWallet] Wallet disconnected
[WalletGuard] Wallet disconnected
```

---

### Scenario 3: User Switches Wallet Address

```
User has wallet A connected
User opens wallet extension and switches to wallet B
    ↓
RainbowKit updates useAccount() hook:
  - address: "0x2..." (was "0x1...")
  - isConnected: true (was true)
    ↓
ConnectWallet.tsx detects state change:
  previousState: { address: "0x1...", isConnected: true }
  currentState: { address: "0x2...", isConnected: true }
    ↓
✓ Condition met: isConnected && previousState.address && address && previousState.address !== address
    ↓
  1. localStorage.setItem('veilpass_account', address) // Now "0x2..."
  2. window.dispatchEvent(new Event('walletConnected')) // Re-fire to notify
  3. No redirect (already on page)
    ↓
Other components listening to 'walletConnected':
  - Header.tsx: Updates userWallet display
  - Pages with useEffect on account: Re-fetch user data
```

**Console Output:**
```
[ConnectWallet] Wallet address changed: 0x2...9abc
```

---

## WalletGuard Modal Detection

### Protected Page Access Without Wallet

```
User navigates to /dashboard without wallet connected
    ↓
WalletGuard component mounts
    ↓
useEffect detects:
  - pathname: '/dashboard'
  - requiresWallet: true (not in publicPages)
  - account from localStorage: null
    ↓
✓ Shows overlay modal:
  "Wallet Disconnected"
  "Your wallet has been disconnected..."
  [Connect Wallet button] [Go to Home]
```

### User Connects While Modal Showing

```
User on protected page with overlay visible
    ↓
User clicks "Connect Wallet" button
    ↓
ConnectWallet.tsx dispatches 'walletConnected'
    ↓
WalletGuard.tsx listens and:
  1. Gets account from localStorage
  2. Calls updateOverlay(account)
  3. Sets showOverlay: false
  4. Overlay disappears, user sees page content
```

**Console Output:**
```
[ConnectWallet] Wallet connected: 0x...
[WalletGuard] Wallet connected: 0x...
```

### User Disconnects While on Protected Page

```
User on /seller/events (protected page)
    ↓
User disconnects wallet in extension
    ↓
ConnectWallet.tsx dispatches 'walletDisconnected'
    ↓
WalletGuard.tsx listens and:
  1. Sets account to null
  2. Calls updateOverlay(null)
  3. Sets showOverlay: true (requiresWallet is true)
  4. Overlay modal appears
```

**Console Output:**
```
[ConnectWallet] Wallet disconnected
[WalletGuard] Wallet disconnected
```

---

## Mobile Menu Behavior

### Opening Menu
```
User on small screen (mobile)
User clicks ☰ hamburger icon
    ↓
mobileMenuOpen state: false → true
    ↓
Mobile menu appears with:
  - Dashboard link
  - Events link
  - Auctions link
  - Language selector (mobile only)
```

### Closing Menu (Scenarios)

1. **Click menu icon again**
   ```
   mobileMenuOpen: true → false
   Menu collapses
   ```

2. **Click a navigation link**
   ```
   onClick handler:
     - Navigate to page
     - setMobileMenuOpen(false)
   Menu auto-closes
   ```

3. **Connect wallet**
   ```
   walletConnected event fires
   Header.tsx handler:
     - setMobileMenuOpen(false)
   Menu auto-closes
   ```

4. **Disconnect wallet**
   ```
   walletDisconnected event fires
   Header.tsx handler:
     - setMobileMenuOpen(false)
   Menu auto-closes
   ```

---

## Debugging with Console

### Enable Connection Logging

The code includes automatic logging. Open browser DevTools (F12) and watch the Console:

```javascript
// When user connects
[ConnectWallet] Wallet connected: 0x1234567890123456789012345678901234567890
[WalletGuard] Wallet connected: 0x1234567890123456789012345678901234567890

// When user disconnects
[ConnectWallet] Wallet disconnected
[WalletGuard] Wallet disconnected

// When user switches wallets
[ConnectWallet] Wallet address changed: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
[WalletGuard] Wallet connected: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### Check localStorage

```javascript
// In browser console:
localStorage.getItem('veilpass_account')
// Returns: "0x..." or null
```

### Monitor Events Manually

```javascript
// Listen to wallet events in console:
window.addEventListener('walletConnected', () => console.log('✓ Connected'));
window.addEventListener('walletDisconnected', () => console.log('✗ Disconnected'));
```

---

## Common Issues & Fixes

### Issue: Overlay still shows after connecting
**Cause:** Event not firing or listener not attached
**Fix:** 
1. Check browser console for logged events
2. Verify localStorage has 'veilpass_account'
3. Refresh page with F5
4. Check that WalletGuard wraps the page

### Issue: Mobile menu doesn't close on connect
**Cause:** Header event listener not firing
**Fix:**
1. Ensure Header component is in scope of window
2. Check that ConnectWallet is rendering
3. Verify walletConnected event is dispatching

### Issue: Wallet address not updating in header
**Cause:** userWallet state not syncing
**Fix:**
1. Check that event listeners are registered (DevTools Console tab)
2. Verify ConnectWallet is dispatching events
3. Check localStorage for account address

---

## Performance Notes

- Event listeners are properly cleaned up with useEffect return functions
- No memory leaks from duplicate listeners
- useCallback prevents unnecessary re-renders of overlay logic
- useRef comparison is O(1) for state change detection
