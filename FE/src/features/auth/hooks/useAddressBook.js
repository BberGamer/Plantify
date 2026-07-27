// useAddressBook.js - Quản lý danh sách, lựa chọn và thao tác CRUD địa chỉ giao hàng
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createMyAddressApi,
  deleteMyAddressApi,
  getMyAddressesApi,
  getVietnamProvincesApi,
  setDefaultAddressApi,
  updateMyAddressApi,
} from "@/features/auth/api";

/** Lấy payload địa chỉ từ response API. @param {Object} response - Response cần mở gói. @returns {Array|Object} Payload bên trong hoặc mảng rỗng. */
function unwrapData(response) {
  return response?.data || response || [];
}

/** Chuẩn hóa API tỉnh/thành v1 và v2 về danh sách tỉnh có wards. @param {Array} data - Dữ liệu tỉnh thành. @returns {Object[]} Danh sách tỉnh và phường/xã chuẩn hóa. */
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

const EMPTY_FORM = {
  label: "Nhà riêng",
  receiverName: "",
  phone: "",
  street: "",
  provinceCode: "",
  wardCode: "",
  isDefault: false,
};

/**
 * Quản lý tải dữ liệu tỉnh thành, CRUD địa chỉ và state form sổ địa chỉ.
 * @param {boolean} enabled - Có cho phép tải sổ địa chỉ hay không.
 * @param {Object} user - Người dùng hiện tại dùng làm giá trị form mặc định.
 * @returns {Object} State địa chỉ, form, lựa chọn tỉnh và các handler CRUD.
 */
export function useAddressBook(enabled, user) {
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [provinceError, setProvinceError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const selectedProvince = useMemo(
    () => provinces.find((province) => province.code === form.provinceCode),
    [form.provinceCode, provinces]
  );
  const selectedWard = useMemo(
    () => selectedProvince?.wards.find((ward) => ward.code === form.wardCode),
    [form.wardCode, selectedProvince]
  );

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      receiverName: current.receiverName || user.fullName || "",
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

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

  useEffect(() => {
    if (provinceError) {
      toast.error("Không thể tải danh sách tỉnh/thành, vui lòng thử lại sau.");
    }
  }, [provinceError]);

  useEffect(() => {
    if (addressError) {
      toast.error(
        addressError.response?.data?.message || "Không thể tải sổ địa chỉ."
      );
    }
  }, [addressError]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      receiverName: user?.fullName || "",
      phone: user?.phone || "",
    });
  };
  const handleProvinceChange = (provinceCode) => {
    setForm((current) => ({ ...current, provinceCode, wardCode: "" }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.street.trim() || !selectedProvince || !selectedWard) {
      toast.error("Vui lòng nhập đủ địa chỉ chi tiết, tỉnh/thành và xã/phường.");
      return;
    }
    try {
      await saveAddress(editingId, {
        ...form,
        provinceName: selectedProvince.name,
        wardName: selectedWard.name,
      });
      toast.success(editingId ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ.");
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu địa chỉ.");
    }
  };
  const handleEdit = (address) => {
    setEditingId(address._id);
    setForm({
      label: address.label || "Nhà riêng",
      receiverName: address.receiverName || "",
      phone: address.phone || "",
      street: address.street || "",
      provinceCode: String(address.provinceCode || ""),
      wardCode: String(address.wardCode || ""),
      isDefault: Boolean(address.isDefault),
    });
  };
  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      toast.success("Đã chọn địa chỉ mặc định.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể đặt địa chỉ mặc định."
      );
    }
  };
  const handleDelete = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await deleteAddress(addressId);
      toast.success("Đã xóa địa chỉ.");
      if (editingId === addressId) resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa địa chỉ.");
    }
  };

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
    editingId,
    form,
    handleDelete,
    handleEdit,
    handleProvinceChange,
    handleSetDefault,
    handleSubmit,
    resetForm,
    selectedProvince,
    setForm,
  };
}
