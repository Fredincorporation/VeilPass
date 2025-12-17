# Toast System Quick Reference

## Import Toast Hook
```typescript
import { useToast } from '@/components/ToastContainer';
```

## Destructure in Component
```typescript
const { showSuccess, showError, showWarning, showInfo, showToast } = useToast();
```

## Usage Methods

### 1. Success Message (Green)
```typescript
showSuccess('Settings saved successfully');
showSuccess('Event created! You will be redirected shortly.');
showSuccess('Ticket downloaded successfully');
```

### 2. Error Message (Red)
```typescript
showError('Failed to save settings');
showError('Event title is required');
showError('Failed to disconnect wallet');
```

### 3. Warning Message (Amber/Orange)
```typescript
showWarning('Are you sure you want to continue?');
showWarning('You need 500 more points to redeem this');
showWarning('Event image is recommended');
```

### 4. Info Message (Blue)
```typescript
showInfo('Generating PDF report...');
showInfo('Displaying QR code for ticket TK001');
showInfo('Opening event details for Summer Music Festival');
```

### 5. Custom Toast
```typescript
showToast('Custom message text', 'success', 5000); // Dismiss after 5 seconds
showToast('Loading data...', 'info', 3000);
```

## Integration Checklist

- [ ] Import `useToast` from `@/components/ToastContainer`
- [ ] Add to component: `const { showSuccess, showError, ... } = useToast();`
- [ ] Call appropriate toast method on user actions
- [ ] Wrap in try-catch if handling async operations
- [ ] Test all success and error paths

## Common Patterns

### Form Submission
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Validate form
    if (!formData.required) {
      showError('Required field is empty');
      return;
    }
    // Submit data
    await submitForm(formData);
    showSuccess('Form submitted successfully');
    // Redirect or reset
  } catch (error) {
    showError('Failed to submit form');
  }
};
```

### Async Action
```typescript
const handleExport = async () => {
  showInfo('Generating report...');
  try {
    const result = await generateReport();
    showSuccess('Report generated and downloaded');
  } catch (error) {
    showError('Failed to generate report');
  }
};
```

### Validation Warning
```typescript
const handleRedeem = () => {
  if (userPoints < requiredPoints) {
    showWarning(`You need ${requiredPoints - userPoints} more points`);
    return;
  }
  showSuccess('Points redeemed!');
};
```

## Pages Already Integrated

✅ Seller Settings
✅ Create Event
✅ My Events
✅ Sales Analytics
✅ Loyalty
✅ Tickets

## Auto-Dismiss Duration
- Default: 4000ms (4 seconds)
- Customizable per toast via `showToast(msg, type, duration)`

## Features
- ✅ Auto-dismiss with manual close option
- ✅ Smooth animations (fade + slide)
- ✅ Dark mode support
- ✅ Icon indicators per type
- ✅ Color-coded backgrounds
- ✅ Bottom-right positioning
- ✅ Multiple toasts queue
- ✅ No overlapping

## Styling Reference

### Toast Types
| Type | Hex | Tailwind |
|------|-----|----------|
| Success | #10B981 | from-green-50 |
| Error | #EF4444 | from-red-50 |
| Warning | #F59E0B | from-amber-50 |
| Info | #3B82F6 | from-blue-50 |

---

Last Updated: [Current Session]
