// features/partners/hooks/usePartners.ts
/**
 * Partners & Insurance API Hooks
 */
"use client";
import { useState, useCallback } from "react";
import { api } from "@/src/shared/api/axios";
import type {
  Partner,
  CustomerPartnerLink,
  InsuranceClaim,
  ClaimCreate,
  PartnerStatement,
  // PartnerDashboard,
  PaymentSplit,
} from "../types/partners.types";

/**
 * Hook for managing Partners
 */
export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest("crm_partners_list", params);
      setPartners(data.results || data);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب الشركاء");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPartner = useCallback(
    async (id: number): Promise<Partner | null> => {
      try {
        const data = await api.customRequest("crm_partners_retrieve", { id });
        return data;
      } catch (err) {
        return null;
      }
    },
    [],
  );

  const createPartner = useCallback(
    async (partner: Partial<Partner>) => {
      setLoading(true);
      try {
        const data = await api.customRequest("crm_partners_create", partner);
        await fetchPartners();
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في إنشاء الشريك");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPartners],
  );

  const updatePartner = useCallback(
    async (id: number, partner: Partial<Partner>) => {
      setLoading(true);
      try {
        const data = await api.customRequest("crm_partners_partial_update", {
          id,
          ...partner,
        });
        await fetchPartners();
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في تحديث الشريك");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPartners],
  );

  return {
    partners,
    loading,
    error,
    fetchPartners,
    getPartner,
    createPartner,
    updatePartner,
  };
}

/**
 * Hook for Partner-Customer Links
 */
export function usePartnerCustomers() {
  const [links, setLinks] = useState<CustomerPartnerLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest(
        "crm_partner_customers_list",
        params,
      );
      setLinks(data.results || data);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب الروابط");
    } finally {
      setLoading(false);
    }
  }, []);

  const linkCustomer = useCallback(
    async (
      customerId: number,
      partnerId: number,
      data: Partial<CustomerPartnerLink>,
    ) => {
      setLoading(true);
      try {
        const result = await api.customRequest("crm_partner_customers_create", {
          customer: customerId,
          partner: partnerId,
          ...data,
        });
        await fetchLinks();
        return result;
      } catch (err: any) {
        setError(err?.message || "فشل في ربط العميل");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchLinks],
  );

  const getCustomerPartners = useCallback(async (customerId: number) => {
    try {
      const data = await api.customRequest("crm_partner_customers_list", {
        customer: customerId,
      });
      return data.results || data;
    } catch (err) {
      return [];
    }
  }, []);

  return {
    links,
    loading,
    error,
    fetchLinks,
    linkCustomer,
    getCustomerPartners,
  };
}

/**
 * Hook for Insurance Claims
 */
export function useInsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest("crm_insurance_claims_list", params);
      setClaims(data.results || data);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب المطالبات");
    } finally {
      setLoading(false);
    }
  }, []);

  const createClaim = useCallback(
    async (claim: ClaimCreate) => {
      setLoading(true);
      try {
        const data = await api.customRequest(
          "crm_insurance_claims_create",
          claim,
        );
        await fetchClaims();
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في إنشاء المطالبة");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchClaims],
  );

  const updateClaimStatus = useCallback(
    async (
      claimId: number,
      status: string,
      data?: { approved_amount?: string; rejection_reason?: string },
    ) => {
      setLoading(true);
      try {
        const result = await api.customRequest(
          "crm_insurance_claims_partial_update",
          {
            id: claimId,
            status,
            ...data,
          },
        );
        await fetchClaims();
        return result;
      } catch (err: any) {
        setError(err?.message || "فشل في تحديث الحالة");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchClaims],
  );

  const submitClaim = useCallback(
    async (claimId: number) => {
      return updateClaimStatus(claimId, "submitted", {});
    },
    [updateClaimStatus],
  );

  const approveClaim = useCallback(
    async (claimId: number, approvedAmount: string) => {
      return updateClaimStatus(claimId, "approved", {
        approved_amount: approvedAmount,
      });
    },
    [updateClaimStatus],
  );

  const rejectClaim = useCallback(
    async (claimId: number, reason: string) => {
      return updateClaimStatus(claimId, "rejected", {
        rejection_reason: reason,
      });
    },
    [updateClaimStatus],
  );

  return {
    claims,
    loading,
    error,
    fetchClaims,
    createClaim,
    updateClaimStatus,
    submitClaim,
    approveClaim,
    rejectClaim,
  };
}

/**
 * Hook for Partner Statement
 */
export function usePartnerStatement(partnerId: number) {
  const [statement, setStatement] = useState<PartnerStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!partnerId) return;

      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          partner_id: String(partnerId),
        };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        const data = await api.customRequest(
          "crm_partners_statement_retrieve",
          params,
        );
        setStatement(data);
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في جلب كشف الحساب");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [partnerId],
  );

  return { statement, loading, error, fetchStatement };
}

/**
 * Hook for calculating payment split
 */
export function usePaymentSplit() {
  const calculateSplit = useCallback(
    (
      totalAmount: number,
      patientSharePercentage: number,
      maxPatientShare?: number,
    ): PaymentSplit => {
      let customerShare = (totalAmount * patientSharePercentage) / 100;

      // Apply max patient share cap if exists
      if (maxPatientShare && maxPatientShare > 0) {
        customerShare = Math.min(customerShare, maxPatientShare);
      }

      const partnerShare = Math.max(0, totalAmount - customerShare);

      return {
        total_amount: totalAmount,
        partner_share: Math.round(partnerShare * 100) / 100,
        customer_share: Math.round(customerShare * 100) / 100,
        patient_share_percentage: patientSharePercentage,
      };
    },
    [],
  );

  return { calculateSplit };
}
