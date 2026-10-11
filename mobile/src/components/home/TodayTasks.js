import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TodayTasks() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Việc cần làm hôm nay</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.linkText}>Xem lịch</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {/* Task 1 */}
        <View style={styles.taskItem}>
          <View style={styles.taskIconBox}>
            <Ionicons name="water-outline" size={20} color="#247855" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, styles.completedTitle]}>
              Tưới nước cho Trầu bà
            </Text>
            <Text style={styles.taskTime}>08:00 · Hôm nay</Text>
          </View>
          <View style={styles.checkedBox}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Task 2 */}
        <View style={styles.taskItem}>
          <View style={styles.taskIconBox}>
            <Ionicons name="eye-outline" size={20} color="#247855" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Kiểm tra lá cây Hoa hồng</Text>
            <Text style={styles.taskTime}>09:00 · Hôm nay</Text>
          </View>
          <View style={styles.uncheckedBox} />
        </View>

        <View style={styles.divider} />

        {/* Task 3 */}
        <View style={styles.taskItem}>
          <View style={styles.taskIconBox}>
            <MaterialCommunityIcons name="sprout-outline" size={20} color="#247855" />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Bón phân cho cây Lan</Text>
            <Text style={styles.taskTime}>17:00 · Hôm nay</Text>
          </View>
          <View style={styles.uncheckedBox} />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.footerBtn} activeOpacity={0.7}>
          <Text style={styles.footerBtnText}>Xem lịch chăm sóc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#183B2B',
  },
  linkText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#247855',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBF0EC',
    padding: 16,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  taskIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF8F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#183B2B',
  },
  completedTitle: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  taskTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  checkedBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#72B58C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  footerBtn: {
    alignItems: 'center',
    paddingTop: 6,
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A5B40',
  },
});
