import { useCallback, useEffect, useState } from "react";
import {
  createMyAddressApi,
  deleteMyAddressApi,
  getMyAddressesApi,
  getVietnamProvincesApi,
  setDefaultAddressApi,
  updateMyAddressApi,
} from "@/features/auth/api";

function unwrapData(response) {
  return response?.data || response || [];
}

function normalizeProvinceData(data) {
  return (Array.isArray(data) ? data : []).map((province) => ({
    code: String(province.code),
    name: province.name,
    wards: province.wards?.length
      ? province.wards.map((ward) => ({
          code: String(ward.code),
          name: ward.name,
        }))
      : (province.districts || []).flatMap((district) => (
          (district.wards || []).map((ward) => ({
            code: String(ward.code),
            name: ward.name,
          }))
        )),
  }));
}

export function useAddressBook(enabled) {
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [provinceError, setProvinceError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProvinces() {
      try {
        let data = await getVietnamProvincesApi("v2");
        let normalized = normalizeProvinceData(data);
        if (!normalized.some((province) => province.wards.length)) {
          data = await getVietnamProvincesApi("v1");
          normalized = normalizeProvinceData(data);
        }
        if (!cancelled) setProvinces(normalized);
      } catch (error) {
        if (!cancelled) setProvinceError(error);
      }
    }
    loadProvinces();
    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setAddressError(null);
    try {
      const response = await getMyAddressesApi();
      setAddresses(unwrapData(response));
    } catch (error) {
      setAddressError(error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) refetch();
  }, [enabled, refetch]);

  const mutate = useCallback(async (request) => {
    setSaving(true);
    try {
      const response = await request();
      setAddresses(unwrapData(response));
      return response;
    } finally {
      setSaving(false);
    }
  }, []);

  const saveAddress = useCallback(
    (addressId, payload) => mutate(() => (
      addressId
        ? updateMyAddressApi(addressId, payload)
        : createMyAddressApi(payload)
    )),
    [mutate]
  );
  const setDefaultAddress = useCallback(
    async (addressId) => {
      const response = await setDefaultAddressApi(addressId);
      setAddresses(unwrapData(response));
      return response;
    },
    []
  );
  const deleteAddress = useCallback(
    async (addressId) => {
      const response = await deleteMyAddressApi(addressId);
      setAddresses(unwrapData(response));
      return response;
    },
    []
  );

  return {
    addresses,
    provinces,
    loading,
    saving,
    addressError,
    provinceError,
    refetch,
    saveAddress,
    setDefaultAddress,
    deleteAddress,
  };
}
