# Database Persistence - Action Items & Next Steps

## ✅ Phase 1 Complete

### What's Done
- [x] Analyzed all localStorage values in the app (5+ items found)
- [x] Extended database schema (users table + 2 new tables)
- [x] Created TypeScript interfaces for new tables
- [x] Implemented 3 new React hooks (useUserProfile, useUserPreferences, usePlatformSettings)
- [x] Updated seller registration to save business name to DB
- [x] Updated seller settings to load business name from DB
- [x] Verified build compiles without errors
- [x] Created comprehensive documentation

### Current State
- **Business Name**: ✅ Saving to database on registration
- **Theme Preference**: Ready for integration (needs API)
- **Language Preference**: Ready for integration (needs API)
- **Notification Preferences**: Hooks ready (needs API)
- **Admin Settings**: Hooks ready (needs API)

---

## 🔄 Phase 2: Notification Preferences (NEXT)

### What Needs to Happen

#### Step 1: Create API Endpoints
**File**: `/src/app/api/user/preferences/route.ts` (NEW)

```typescript
// GET /api/user/preferences?wallet=0x...
// Returns: UserPreferences object
// Fetches notification preferences for user

// PUT /api/user/preferences
// Body: { wallet_address, event_reminders, promotions, ...}
// Updates: user_preferences table
```

**Estimated Time**: 30 minutes

#### Step 2: Update Settings Pages
**Files**: 
- `/src/app/settings/page.tsx`
- `/src/app/seller/settings/page.tsx`

Changes:
- Import `useUserPreferences` hook
- Import `useTogglePreference` hook
- Replace local state with database state
- Add `account` state fetching
- Call mutations on preference toggle

**Estimated Time**: 30 minutes

#### Step 3: Test
- [ ] Toggle notification preferences
- [ ] Refresh page - preferences should persist
- [ ] Check database shows updated values
- [ ] Test both customer and seller settings

**Estimated Time**: 15 minutes

**Total Phase 2 Effort**: 1-2 hours

---

## 🔄 Phase 3: Theme & Language Sync (AFTER Phase 2)

### What Needs to Happen

#### Step 1: Update Theme Context
**File**: `/src/lib/theme-context.tsx`

Changes:
- Import `useUpdateUserProfile` hook (but careful - can't use in context)
- On theme change: Call API directly to save theme_preference
- On app startup: Load theme from database if logged in
- Use localStorage as immediate fallback

**Estimated Time**: 30 minutes

#### Step 2: Update Language Detection
**File**: `/src/lib/language-detection.ts`

Changes:
- On language change: Call API to save language_preference
- On app startup: Load from database if logged in
- Use localStorage as immediate fallback

**Estimated Time**: 30 minutes

#### Step 3: Update Theme Switcher
**File**: `/src/components/ThemeSwitcher.tsx`

Changes:
- Get account from localStorage
- On theme change: Call update API
- Show loading state while saving

**Estimated Time**: 20 minutes

#### Step 4: Test
- [ ] Change theme → persists on refresh
- [ ] Change language → persists on refresh
- [ ] Verify database values update
- [ ] Test offline mode (should use localStorage)

**Estimated Time**: 15 minutes

**Total Phase 3 Effort**: 1.5-2 hours

---

## 🔄 Phase 4: Admin Settings (OPTIONAL)

### What Needs to Happen

#### Step 1: Create API Endpoints
**File**: `/src/app/api/admin/settings/route.ts` (NEW)

```typescript
// GET /api/admin/settings
// Returns: PlatformSettings object
// Checks: user role === 'admin'

// PUT /api/admin/settings
// Body: { platform_fee_percentage, enable_auctions, ...}
// Checks: user role === 'admin'
// Updates: platform_settings table
```

**Estimated Time**: 30 minutes

#### Step 2: Update Admin Settings Page
**File**: `/src/app/admin/settings/page.tsx`

Changes:
- Import `usePlatformSettings` hook
- Replace local state with database state
- Add admin role check
- Call mutations on setting change

**Estimated Time**: 30 minutes

#### Step 3: Test
- [ ] Update settings as admin
- [ ] Refresh page - settings persist
- [ ] Check database values
- [ ] Verify non-admin can't update

**Estimated Time**: 15 minutes

**Total Phase 4 Effort**: 1-1.5 hours

---

## Priority Ranking

### 🔴 Critical (Do First)
1. **Phase 2** - Notification preferences currently lost on refresh
2. **Phase 3** - Theme/language preferences need persistence

### 🟡 Important (Do Next)
3. **Phase 4** - Admin settings currently lost on refresh

### 🟢 Nice to Have
4. Additional validation/error handling
5. Audit logging for admin changes
6. Preference import/export for users

---

## Blocking Issues (None Currently)

All necessary infrastructure is in place:
- ✅ Database schema ready
- ✅ TypeScript types defined
- ✅ React hooks implemented
- ✅ Build compiles
- ✅ Patterns established

**No blockers for Phase 2 implementation**.

---

## Documentation Ready

- ✅ `DATABASE_SAVE_REQUIREMENTS.md` - Full analysis of all values
- ✅ `DATABASE_PERSISTENCE_PHASE1.md` - Phase 1 implementation details
- ✅ `DATABASE_PERSISTENCE_SUMMARY.md` - Executive summary
- ✅ This file - Action items

---

## Quick Reference Commands

### Run Database Migrations
```bash
# In Supabase SQL editor, run:
# Copy contents of DATABASE_MIGRATIONS.sql and execute
```

### Check Current Build
```bash
npm run build
```

### Start Development
```bash
npm run dev
```

### Test API Endpoints (Phase 2)
```bash
# After creating /api/user/preferences/route.ts:
curl http://localhost:3000/api/user/preferences?wallet=0x123...
```

---

## Success Criteria per Phase

### Phase 2 Success
- [ ] User can toggle notification preferences
- [ ] Changes persist after page refresh
- [ ] Database shows updated values
- [ ] No console errors
- [ ] API endpoints respond correctly

### Phase 3 Success
- [ ] Change theme → persists on refresh
- [ ] Change language → persists on refresh
- [ ] All users see their saved preferences
- [ ] Offline fallback works

### Phase 4 Success
- [ ] Admin can update platform settings
- [ ] Settings persist
- [ ] Non-admins can't update
- [ ] All settings display current DB values

---

## Current Statistics

- **Total localStorage Values**: 5+ items
- **Values Already in DB**: 1 (wallet) + 1 new (business name)
- **Values Needing DB**: 3 (theme, language, notifications)
- **Admin Values Needing DB**: 10+ settings fields
- **New Hooks Created**: 3
- **API Endpoints Needed**: 3
- **Components to Update**: 4-6
- **Total Estimated Effort**: 4-6 hours

---

## Notes

1. **All hooks use React Query** - Automatic caching and refetching
2. **Mutations invalidate caches** - Data stays fresh
3. **Layered approach** - DB first, localStorage fallback, sensible defaults
4. **Backward compatible** - Existing code continues to work
5. **Type-safe** - Full TypeScript support throughout

---

## Suggested Implementation Order

1. **Week 1**: Phase 2 (Notification Preferences)
   - Creates API pattern for other phases
   - Fixes data loss on settings page refresh
   - Medium effort, high value

2. **Week 1**: Phase 3 (Theme & Language)
   - Reuses API pattern from Phase 2
   - Improves UX significantly
   - Medium effort, high value

3. **Week 2**: Phase 4 (Admin Settings)
   - Lower priority
   - Follows same pattern
   - Lower effort, medium value

---

## Questions to Answer Before Starting Phase 2

1. Should we require database migration first, or make API flexible?
2. Should theme/language updates be fire-and-forget or show saving state?
3. Should we notify user of saves, or silent updates?
4. Should we add rollback capability (undo last change)?

---

## Resources

- React Query Docs: https://tanstack.com/query/latest
- Supabase Client: https://supabase.com/docs/reference/javascript
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction

---

## Contact Points

For questions on:
- **Database schema**: Check DATABASE_MIGRATIONS.sql
- **API patterns**: Check /src/app/api/user/route.ts (existing)
- **Hook patterns**: Check /src/hooks/useUser.ts (existing)
- **Component patterns**: Check /src/app/seller/settings/page.tsx (updated)

