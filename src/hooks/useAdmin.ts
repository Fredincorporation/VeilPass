import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface AdminDispute {
  id: number;
  ticket_id: string;
  event: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  reason: string;
  description: string;
  claimant: string;
  seller: string;
  created_at: string;
  priority: string;
  amount: string;
}

export interface SellerVerification {
  id: string;
  name: string;
  email?: string;
  role?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  kycStatus: string;
  submittedAt: string;
  businessType?: string;
  walletAddress?: string;
}

/**
 * Fetch all disputes for admin
 */
export function useAdminDisputes(filterStatus?: string) {
  return useQuery({
    queryKey: ['adminDisputes', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const { data } = await axios.get<AdminDispute[]>(`/api/admin/disputes${params}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Update dispute status (admin)
 */
export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; status: string; resolution: string }) => {
      const { data } = await axios.put(`/api/admin/disputes/${payload.id}`, {
        status: payload.status,
        resolution: payload.resolution,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDisputes'] });
    },
  });
}

/**
 * Fetch all seller verifications for admin
 */
export function useAdminSellers(filterStatus?: string) {
  return useQuery({
    queryKey: ['adminSellers', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const { data } = await axios.get<SellerVerification[]>(`/api/admin/sellers${params}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Approve or reject seller
 */
export function useApproveSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { sellerId: number; status: 'APPROVED' | 'REJECTED' }) => {
      const { data } = await axios.put(`/api/admin/sellers/${payload.sellerId}`, {
        status: payload.status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSellers'] });
    },
  });
}

/**
 * Fetch seller IDs (user verification)
 */
export function useAdminSellerIds(filterStatus?: string) {
  return useQuery({
    queryKey: ['adminSellerIds', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const { data } = await axios.get(`/api/admin/seller-ids${params}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch admin audit logs
 */
export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data } = await axios.get('/api/admin/audit-logs');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
