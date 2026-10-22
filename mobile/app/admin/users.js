import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../src/theme/colors";
import { garden } from "../../src/components/admin/users/theme";
import useAdminUsers from "../../src/hooks/useAdminUsers";
import {
  UserToastBanner,
  UserHeader,
  UserFilterBar,
  UserCard,
  UserEmptyState,
  UserPagination,
  UserDetailModal,
  UserRoleModal,
  UserStatusModal,
} from "../../src/components/admin/users";

export default function AdminUsersScreen() {
  const {
    currentAdminId,
    users,
    pagination,
    loading,
    refreshing,
    search,
    setSearch,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    toast,
    fetchUsers,
    handleRefresh,
    handleSearchSubmit,
    handleSearchClear,
    // Detail modal
    detailModalVisible,
    setDetailModalVisible,
    selectedUser,
    editFullName,
    setEditFullName,
    editPhone,
    setEditPhone,
    editRole,
    setEditRole,
    editStatus,
    setEditStatus,
    submitting,
    handleOpenDetail,
    handleSaveUserInfo,
    // Status modal
    confirmModalVisible,
    setConfirmModalVisible,
    targetUserForStatus,
    statusLoading,
    handleOpenStatusConfirm,
    handleConfirmStatusChange,
    // Role modal
    roleModalVisible,
    setRoleModalVisible,
    targetUserForRole,
    newRoleSelection,
    setNewRoleSelection,
    handleOpenRoleModal,
    handleConfirmRoleChange,
  } = useAdminUsers();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* TOAST NOTIFICATION BANNER */}
        <UserToastBanner toast={toast} />

        {/* HEADER */}
        <UserHeader
          totalUsers={pagination.totalUsers}
          onRefresh={handleRefresh}
        />

        {/* SEARCH & FILTERS */}
        <UserFilterBar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={handleSearchClear}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        />

        {/* USER LIST */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={garden.forest} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <UserCard
                item={item}
                currentAdminId={currentAdminId}
                onOpenDetail={handleOpenDetail}
                onOpenRole={handleOpenRoleModal}
                onOpenStatus={handleOpenStatusConfirm}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[garden.forest]}
              />
            }
            ListEmptyComponent={<UserEmptyState />}
            ListFooterComponent={
              <UserPagination
                pagination={pagination}
                onPageChange={(page) => fetchUsers(page)}
              />
            }
          />
        )}
      </View>

      {/* MODAL 1: XEM CHI TIET & CAP NHAT THONG TIN */}
      <UserDetailModal
        visible={detailModalVisible}
        user={selectedUser}
        fullName={editFullName}
        onChangeFullName={setEditFullName}
        phone={editPhone}
        onChangePhone={setEditPhone}
        role={editRole}
        onChangeRole={setEditRole}
        status={editStatus}
        onChangeStatus={setEditStatus}
        submitting={submitting}
        onClose={() => setDetailModalVisible(false)}
        onSave={handleSaveUserInfo}
      />

      {/* MODAL 2: DOI VAI TRO NHANH */}
      <UserRoleModal
        visible={roleModalVisible}
        targetUser={targetUserForRole}
        selectedRole={newRoleSelection}
        onSelectRole={setNewRoleSelection}
        submitting={submitting}
        onClose={() => setRoleModalVisible(false)}
        onConfirm={handleConfirmRoleChange}
      />

      {/* MODAL 3: XAC NHAN KHOA / KICH HOAT */}
      <UserStatusModal
        visible={confirmModalVisible}
        targetUser={targetUserForStatus}
        loading={statusLoading}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmStatusChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: garden.forest,
  },
  container: {
    flex: 1,
    backgroundColor: garden.cream,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: garden.inkSoft,
  },
});
