# Database Persistence Requirements - Complete Analysis

## Currently Saved to localStorage (Should Be in Database)

### 1. **Business Name** ✅ JUST ADDED
- **Current Storage**: `localStorage.setItem('veilpass_business_name', formData.businessName)`
- **Location**: `/src/app/sellers/register/page.tsx` line 24
- **User**: Sellers
- **Implementation Status**: ✅ Saving to localStorage, needs database sync
- **Database Location**: Should be in `users` table as `business_name` field
- **Retrieved From**: Registration page Step 1
- **Used In**: 
  - Create Event page (organizer field)
  - Seller settings page (display only)

### 2. **Theme** ✅ PARTIALLY SAVED
- **Current Storage**: 
  - `localStorage.setItem('theme', newTheme)` - ThemeSwitcher.tsx
  - `localStorage.setItem('theme-mode', mode)` - theme-context.tsx
- **Location**: `/src/components/ThemeSwitcher.tsx` line 20, `/src/lib/theme-context.tsx` line 26
- **User**: All authenticated users
- **Implementation Status**: ✅ Saving to localStorage, needs database sync
- **Database Location**: Should be in `users` table as `theme_preference` field (light|dark|auto)
- **Retrieved From**: Theme switcher component
- **Used In**: Global theme system

### 3. **Language** ✅ PARTIALLY SAVED
- **Current Storage**: `localStorage.setItem('veilpass_language', language)`
- **Location**: `/src/lib/language-detection.ts` line 129
- **User**: All users (even unauthenticated)
- **Implementation Status**: ✅ Saving to localStorage, needs database sync
- **Database Location**: Should be in `users` table as `language_preference` field
- **Retrieved From**: Language detection system
- **Used In**: Translation context for i18n

### 4. **Account/Wallet Address** ✅ ALREADY USED
- **Current Storage**: `localStorage.setItem('veilpass_account', userAccount)`
- **Location**: `/src/components/ConnectWallet.tsx` line 90
- **User**: All connected users
- **Implementation Status**: ✅ Already in database (wallet_address in users table)
- **Database Location**: `users.wallet_address`
- **Note**: This is the primary key/identifier

### 5. **Notification Preferences**
- **Current Storage**: Local component state ONLY (NOT saved to localStorage)
- **Location**: `/src/app/settings/page.tsx` and `/src/app/seller/settings/page.tsx`
- **User**: All users
- **Implementation Status**: ❌ NOT PERSISTED - Lost on page refresh
- **Database Location**: Needs new `user_preferences` table OR fields in `users` table
- **Fields Needed**:
  - `event_reminders` (boolean)
  - `promotions` (boolean)
  - `reviews` (boolean)
  - `auctions` (boolean)
  - `disputes` (boolean)
  - `newsletter` (boolean)
  - `news_and_updates` (boolean)

### 6. **Admin Settings** 
- **Current Storage**: Local component state ONLY (NOT saved anywhere)
- **Location**: `/src/app/admin/settings/page.tsx`
- **User**: Admin only
- **Implementation Status**: ❌ NOT PERSISTED - Lost on page refresh
- **Database Location**: Needs new `platform_settings` table
- **Fields Needed**:
  - Platform name, version
  - Maintenance mode flag
  - Fee percentages
  - Security settings
  - Feature flags

---

## Database Modifications Needed

### 1. Extend `users` Table
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'auto';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language_preference VARCHAR(5) DEFAULT 'en';
```

### 2. Create `user_preferences` Table
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  event_reminders BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT true,
  reviews BOOLEAN DEFAULT true,
  auctions BOOLEAN DEFAULT true,
  disputes BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT false,
  news_and_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_prefs FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);
```

### 3. Create `platform_settings` Table (Admin)
```sql
CREATE TABLE IF NOT EXISTS platform_settings (
  id BIGSERIAL PRIMARY KEY,
  platform_name VARCHAR(255) DEFAULT 'VeilPass',
  platform_version VARCHAR(20) DEFAULT '1.0.0',
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  platform_fee_percentage NUMERIC(5, 2) DEFAULT 2.5,
  minimum_ticket_price NUMERIC(10, 2) DEFAULT 0.05,
  maximum_ticket_price NUMERIC(10, 2) DEFAULT 1000,
  payout_threshold NUMERIC(10, 2) DEFAULT 100,
  enable_two_factor BOOLEAN DEFAULT true,
  max_login_attempts INTEGER DEFAULT 5,
  session_timeout INTEGER DEFAULT 30,
  require_kyc BOOLEAN DEFAULT true,
  enable_auctions BOOLEAN DEFAULT true,
  enable_disputes BOOLEAN DEFAULT true,
  enable_loyalty BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Implementation Priority

### PHASE 1 - IMMEDIATE (High Impact, Easy Implementation)
1. ✅ **Business Name** → Already saving to localStorage, just needs database sync
   - Add field to `users` table
   - Update seller registration to save to database
   - Update seller settings to load from database
   - Update create-event to use database value

2. **Theme Preference** → Already saving to localStorage, just needs database sync
   - Add field to `users` table
   - Update theme-context to load/save from database
   - Sync on login

3. **Language Preference** → Already saving to localStorage, just needs database sync
   - Add field to `users` table
   - Update language-detection to save to database
   - Load from database on login

### PHASE 2 - MEDIUM (Medium Impact)
4. **Notification Preferences** → Currently only in local state
   - Create `user_preferences` table
   - Add `useUserPreferences()` hook
   - Update settings pages to use hook
   - Persist changes on every toggle

### PHASE 3 - ADMIN (Lower Priority)
5. **Platform Settings** → Currently only in local state
   - Create `platform_settings` table
   - Add `usePlatformSettings()` hook
   - Update admin settings page
   - Add permission check (admin only)

---

## Files to Update (By Priority)

### Phase 1 Updates:
- `/DATABASE_MIGRATIONS.sql` - Add new columns and tables
- `/src/lib/supabase.ts` - Update User interface
- `/src/app/sellers/register/page.tsx` - Save businessName to DB
- `/src/app/seller/settings/page.tsx` - Load businessName from DB
- `/src/app/seller/create-event/page.tsx` - Use DB businessName
- `/src/lib/theme-context.tsx` - Load/save theme to DB
- `/src/lib/language-detection.ts` - Load/save language to DB
- New hook: `/src/hooks/useUserProfile.ts` - Get/update user profile fields

### Phase 2 Updates:
- `/DATABASE_MIGRATIONS.sql` - Add user_preferences table
- `/src/lib/supabase.ts` - Add UserPreferences interface
- `/src/app/settings/page.tsx` - Use notification preferences hook
- `/src/app/seller/settings/page.tsx` - Use notification preferences hook
- New hook: `/src/hooks/useUserPreferences.ts`

### Phase 3 Updates:
- `/DATABASE_MIGRATIONS.sql` - Add platform_settings table
- `/src/lib/supabase.ts` - Add PlatformSettings interface
- `/src/app/admin/settings/page.tsx` - Use platform settings hook
- New hook: `/src/hooks/usePlatformSettings.ts`

---

## Summary

**Total localStorage Values to Persist**: 5+ items
- **Already Partially Done**: 3 (businessName, theme, language)
- **Need Implementation**: 2+ (notification prefs, admin settings)

**Database Tables to Create**: 2
- `user_preferences` - User notification & general preferences
- `platform_settings` - Admin platform configuration

**New Hooks to Create**: 3
- `useUserProfile()` - Get/update user profile + business name
- `useUserPreferences()` - Get/update user preferences
- `usePlatformSettings()` - Get/update platform settings (admin only)

**Estimated Implementation Time**: 4-6 hours
