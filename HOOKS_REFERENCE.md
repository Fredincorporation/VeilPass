# VeilPass Supabase Hooks Quick Reference

## Quick Start Examples

### 1. Fetch Events
```tsx
import { useEvents } from '@/hooks/useEvents';

export function EventsList() {
  const { data: events, isLoading, error } = useEvents();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### 2. Fetch User Profile
```tsx
import { useUser } from '@/hooks/useUser';

export function UserProfile() {
  const walletAddress = localStorage.getItem('veilpass_account');
  const { data: user } = useUser(walletAddress || undefined);

  return (
    <div>
      <p>Loyalty Points: {user?.loyalty_points}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### 3. Fetch User Tickets
```tsx
import { useTickets } from '@/hooks/useTickets';

export function MyTickets() {
  const walletAddress = localStorage.getItem('veilpass_account');
  const { data: tickets, isLoading } = useTickets(walletAddress || undefined);

  if (isLoading) return <div>Loading tickets...</div>;

  return (
    <div>
      {tickets?.map(ticket => (
        <div key={ticket.id}>{ticket.id}</div>
      ))}
    </div>
  );
}
```

### 4. Create a Ticket (Purchase)
```tsx
import { useCreateTicket } from '@/hooks/useTickets';

export function PurchaseTicket() {
  const createTicketMutation = useCreateTicket();
  const walletAddress = localStorage.getItem('veilpass_account') || '';

  const handlePurchase = () => {
    createTicketMutation.mutate({
      event_id: 1,
      owner_address: walletAddress,
      section: 'A10',
      price: 0.25,
      status: 'active',
    });
  };

  return (
    <button onClick={handlePurchase} disabled={createTicketMutation.isPending}>
      {createTicketMutation.isPending ? 'Purchasing...' : 'Buy Ticket'}
    </button>
  );
}
```

### 5. Fetch Active Auctions
```tsx
import { useAuctions } from '@/hooks/useAuctions';

export function ActiveAuctions() {
  const { data: auctions } = useAuctions('active');

  return (
    <div>
      {auctions?.map(auction => (
        <div key={auction.id}>
          Start Bid: ${auction.start_bid}
        </div>
      ))}
    </div>
  );
}
```

### 6. Place a Bid
```tsx
import { usePlaceBid } from '@/hooks/useBids';

export function PlaceBidButton() {
  const placeBidMutation = usePlaceBid();
  const walletAddress = localStorage.getItem('veilpass_account') || '';

  const handleBid = () => {
    placeBidMutation.mutate({
      auction_id: 1,
      bidder_address: walletAddress,
      amount: 500,
      encrypted: true,
    });
  };

  return (
    <button onClick={handleBid} disabled={placeBidMutation.isPending}>
      {placeBidMutation.isPending ? 'Placing...' : 'Place Bid'}
    </button>
  );
}
```

### 7. Update User Profile
```tsx
import { useUpdateUser } from '@/hooks/useUser';

export function UpdateProfile() {
  const updateUserMutation = useUpdateUser();
  const walletAddress = localStorage.getItem('veilpass_account') || '';

  const handleUpdate = () => {
    updateUserMutation.mutate({
      wallet_address: walletAddress,
      loyalty_points: 1000,
      role: 'seller',
    });
  };

  return (
    <button onClick={handleUpdate} disabled={updateUserMutation.isPending}>
      Update Profile
    </button>
  );
}
```

### 8. Create an Auction (List Ticket)
```tsx
import { useCreateAuction } from '@/hooks/useAuctions';

export function ListForAuction() {
  const createAuctionMutation = useCreateAuction();
  const walletAddress = localStorage.getItem('veilpass_account') || '';

  const handleCreateAuction = () => {
    createAuctionMutation.mutate({
      ticket_id: 'ticket-uuid-here',
      seller_address: walletAddress,
      start_bid: 250,
      listing_price: 500,
      reserve_price: 300,
      duration_hours: 48,
      end_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    });
  };

  return (
    <button onClick={handleCreateAuction} disabled={createAuctionMutation.isPending}>
      List for Auction
    </button>
  );
}
```

## Hook API Reference

### useEvents()
- **Returns:** `{ data: Event[], isLoading, error }`
- **Features:** Auto-refetch every 5 minutes
- **Usage:** Fetch all events

### useTickets(walletAddress)
- **Returns:** `{ data: Ticket[], isLoading, error }`
- **Params:** `walletAddress` (optional)
- **Features:** Auto-filter by wallet if provided
- **Usage:** Fetch user's tickets

### useCreateTicket()
- **Returns:** `{ mutate, isPending, error }`
- **Params:** Ticket object (without id, created_at)
- **Features:** Auto-invalidates useTickets on success
- **Usage:** Purchase a ticket

### useUpdateTicket()
- **Returns:** `{ mutate, isPending, error }`
- **Params:** Partial ticket with id
- **Usage:** Update ticket status

### useAuctions(status)
- **Returns:** `{ data: Auction[], isLoading, error }`
- **Params:** `status` - 'active', 'ended', 'sold' (optional)
- **Features:** Auto-refetch every 2 minutes
- **Usage:** Fetch auctions

### useCreateAuction()
- **Returns:** `{ mutate, isPending, error }`
- **Usage:** List ticket for auction

### useBids(auctionId)
- **Returns:** `{ data: Bid[], isLoading, error }`
- **Params:** `auctionId` (optional)
- **Features:** Auto-refetch every 1 minute
- **Usage:** Fetch bids for auction

### usePlaceBid()
- **Returns:** `{ mutate, isPending, error }`
- **Usage:** Place encrypted bid

### useUser(walletAddress)
- **Returns:** `{ data: User, isLoading, error }`
- **Params:** `walletAddress` (optional)
- **Features:** Auto-creates user if doesn't exist
- **Usage:** Get user profile

### useUpdateUser()
- **Returns:** `{ mutate, isPending, error }`
- **Usage:** Update user profile

### useWalletAuthentication(walletAddress)
- **Returns:** `{ user, isLoading, error, incrementLoyaltyPoints, updateUserRole }`
- **Params:** `walletAddress`
- **Features:** Higher-level hook with helper methods
- **Usage:** Manage wallet authentication

## Common Patterns

### Loading State
```tsx
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;
```

### Mutation with Toast
```tsx
const mutation = useCreateTicket();

const handleClick = () => {
  mutation.mutate(ticketData);
};

// In component:
useEffect(() => {
  if (mutation.isSuccess) {
    showSuccess('Ticket purchased!');
  }
  if (mutation.error) {
    showError('Purchase failed');
  }
}, [mutation.isSuccess, mutation.error]);
```

### Refetch Data
```tsx
const { data, refetch } = useEvents();

const handleRefresh = () => {
  refetch();
};
```

### Query Invalidation (Advanced)
```tsx
const queryClient = useQueryClient();

const mutation = useCreateTicket();

mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
  },
});
```

## Error Handling

### Basic Error Display
```tsx
const { data, error } = useEvents();

if (error) {
  return <div className="text-red-500">Error: {error.message}</div>;
}
```

### Advanced Error Handling
```tsx
const { data, error, status } = useEvents();

switch (status) {
  case 'pending':
    return <LoadingSpinner />;
  case 'error':
    return <ErrorAlert error={error} />;
  case 'success':
    return <EventsList events={data} />;
}
```

## Combining Multiple Hooks

```tsx
export function DashboardWithData() {
  const wallet = localStorage.getItem('veilpass_account');
  
  const { data: user } = useUser(wallet || undefined);
  const { data: tickets } = useTickets(wallet || undefined);
  const { data: auctions } = useAuctions('active');

  if (!user || !tickets) return <LoadingSpinner />;

  return (
    <div>
      <UserProfile user={user} />
      <TicketsList tickets={tickets} />
      <AuctionsList auctions={auctions} />
    </div>
  );
}
```
