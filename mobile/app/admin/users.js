

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { garden } from "../../src/components/admin/users/theme";
import ListError from "../../src/components/common/ListError";
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
    listError,
    search,
    changeSearch,
    selectedRole,
    selectRole,
    selectedStatus,
    selectStatus,
    toast,
    fetchUsers,
    handleRefresh,
    handleSearchSubmit,
    handleSearchClear,
    // Detail modal
    detailModalVisible,
    closeDetail,
    changeField,
    selectedUser,
    editFullName,
    editPhone,
    editRole,
    editStatus,
    submitting,
    handleOpenDetail,
    handleSaveUserInfo,
    // Status modal
    confirmModalVisible,
    closeStatus,
    targetUserForStatus,
    statusLoading,
    handleOpenStatusConfirm,
    handleConfirmStatusChange,
    // Role modal
    roleModalVisible,
    closeRole,
    targetUserForRole,
    newRoleSelection,
    selectNewRole,
    handleOpenRoleModal,
    handleConfirmRoleChange,
  } = useAdminUsers();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* TOAST NOTIFICATION BANNER */}
        <UserToastBanner toast={toast} />

        {/* HEADER */}
        <UserHeader totalUsers={pagination.total} onRefresh={handleRefresh} />

        {/* SEARCH & FILTERS */}
        <UserFilterBar
          search={search}
          onSearchChange={changeSearch}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          selectedRole={selectedRole}
          onSelectRole={selectRole}
          selectedStatus={selectedStatus}
          onSelectStatus={selectStatus}
        />

        {!!listError && (
          <ListError message={listError} onRetry={handleRefresh} busy={loading || refreshing} />
        )}
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
            ListEmptyComponent={!listError && <UserEmptyState />}
            ListFooterComponent={
              <UserPagination
                pagination={pagination}
                disabled={loading || refreshing || !!listError}
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
        onChangeFullName={(value) => changeField("fullName", value)}
        phone={editPhone}
        onChangePhone={(value) => changeField("phone", value)}
        role={editRole}
        onChangeRole={(value) => changeField("role", value)}
        status={editStatus}
        onChangeStatus={(value) => changeField("status", value)}
        submitting={submitting}
        onClose={closeDetail}
        onSave={handleSaveUserInfo}
      />

      {/* MODAL 2: DOI VAI TRO NHANH */}
      <UserRoleModal
        visible={roleModalVisible}
        targetUser={targetUserForRole}
        selectedRole={newRoleSelection}
        onSelectRole={selectNewRole}
        submitting={submitting}
        onClose={closeRole}
        onConfirm={handleConfirmRoleChange}
      />

      {/* MODAL 3: XAC NHAN KHOA / KICH HOAT */}
      <UserStatusModal
        visible={confirmModalVisible}
        targetUser={targetUserForStatus}
        loading={statusLoading}
        onClose={closeStatus}
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
