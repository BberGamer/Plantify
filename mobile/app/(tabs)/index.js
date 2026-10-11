import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Tưới nước cho Trầu bà',
      time: '08:00 · Hôm nay',
      completed: true,
      icon: 'water-outline',
      iconColor: '#2D6A4F',
      bgColor: '#E8F5E9',
    },
    {
      id: 2,
      title: 'Kiểm tra lá cây Hoa hồng',
      time: '09:00 · Hôm nay',
      completed: false,
      icon: 'leaf-outline',
      iconColor: '#E67E22',
      bgColor: '#FFF3E0',
    },
    {
      id: 3,
      title: 'Bón phân cho cây Lan',
      time: '17:00 · Hôm nay',
      completed: false,
      icon: 'nutrition-outline',
      iconColor: '#2980B9',
      bgColor: '#E1F5FE',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const toggleTask = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const plants = [
    {
      id: '1',
      name: 'Trầu bà',
      status: 'Khỏe mạnh',
      statusColor: '#198754',
      statusBg: '#E8F5E9',
      imageBg: '#D8F3DC',
      icon: 'leaf',
      iconColor: '#2D6A4F',
    },
    {
      id: '2',
      name: 'Hoa hồng',
      status: 'Cần kiểm tra lá',
      statusColor: '#E67E22',
      statusBg: '#FFF3E0',
      imageBg: '#FFD7D7',
      icon: 'flower-outline',
      iconColor: '#D81B60',
    },
    {
      id: '3',
      name: 'Cà chua',
      status: 'Đang theo dõi',
      statusColor: '#6C757D',
      statusBg: '#F1F3F5',
      imageBg: '#FFE0B2',
      icon: 'nutrition-outline',
      iconColor: '#E65100',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Ionicons name="leaf" size={26} color={theme.colors.primary} />
            <Text style={styles.logoText}>Plantify</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.colors.text}
              />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
              <Text style={styles.avatarText}>AN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSub}>Xin chào, người yêu cây!</Text>
          <Text style={styles.greetingTitle}>
            Hôm nay khu vườn của bạn{'\n'}thế nào?
          </Text>
        </View>

        {/* 3. AI Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI chăm cây thông minh</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerContentRow}>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>
                Để AI giúp bạn chăm{'\n'}cây tốt hơn
              </Text>
              <Text style={styles.bannerDesc}>
                Chụp ảnh để nhận diện cây và phát hiện dấu hiệu bệnh chỉ trong vài giây.
              </Text>

              <TouchableOpacity style={styles.scanButton} activeOpacity={0.85}>
                <Ionicons name="scan-outline" size={18} color={theme.colors.dark} />
                <Text style={styles.scanButtonText}>Quét cây ngay</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bannerImagePlaceholder}>
              <Ionicons name="leaf" size={54} color="#52B788" />
              <View style={styles.placeholderAccentCircle} />
            </View>
          </View>

          <TouchableOpacity style={styles.bannerFooterLink} activeOpacity={0.7}>
            <Text style={styles.bannerFooterLinkText}>
              Tìm hiểu cách chăm cây ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Khám phá Plantify */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Khám phá Plantify</Text>
        </View>
        <View style={styles.gridContainer}>
          {/* Card 1 */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.75}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="leaf-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridCardTitle}>Nhận diện cây</Text>
              <Text style={styles.gridCardSubtitle}>Biết tên cây tức thì</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.75}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="medkit-outline" size={22} color="#E65100" />
            </View>
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridCardTitle}>Chẩn đoán bệnh</Text>
              <Text style={styles.gridCardSubtitle}>Kiểm tra dấu hiệu lạ</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.75}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="grid-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridCardTitle}>Vườn của tôi</Text>
              <Text style={styles.gridCardSubtitle}>Quản lý 12 cây</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Card 4 */}
          <TouchableOpacity style={styles.gridCard} activeOpacity={0.75}>
            <View style={[styles.gridIconCircle, { backgroundColor: '#F5F0EB' }]}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color="#795548"
              />
            </View>
            <View style={styles.gridTextContainer}>
              <Text style={styles.gridCardTitle}>Trợ lý AI</Text>
              <Text style={styles.gridCardSubtitle}>Hỏi đáp chăm cây</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 5. Vườn cây của bạn (Stats Card) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Vườn cây của bạn</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionLink}>Xem vườn</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Tổng số cây</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                9
              </Text>
              <Text style={styles.statLabel}>Khỏe mạnh</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={[styles.statNumber, { color: '#E67E22' }]}>
                3
              </Text>
              <Text style={styles.statLabel}>Cần chăm sóc</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Sức khỏe tổng quan</Text>
              <Text style={styles.progressPercent}>75% tốt</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Xem vườn của tôi</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Cây của bạn (Horizontal Plant List) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Cây của bạn</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionLink}>Tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plantsHorizontalList}
        >
          {plants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.plantCard}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.plantImageContainer,
                  { backgroundColor: plant.imageBg },
                ]}
              >
                <Ionicons name={plant.icon} size={42} color={plant.iconColor} />
              </View>
              <Text style={styles.plantName}>{plant.name}</Text>
              <View
                style={[
                  styles.plantStatusBadge,
                  { backgroundColor: plant.statusBg },
                ]}
              >
                <Text
                  style={[
                    styles.plantStatusText,
                    { color: plant.statusColor },
                  ]}
                >
                  {plant.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 7. Việc cần làm hôm nay (Task List) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Việc cần làm hôm nay</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.sectionLink}>Xem lịch</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.taskCard}>
          {tasks.map((task, index) => (
            <View key={task.id}>
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.taskIconCircle,
                    { backgroundColor: task.bgColor },
                  ]}
                >
                  <Ionicons name={task.icon} size={20} color={task.iconColor} />
                </View>

                <View style={styles.taskContent}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskTime}>{task.time}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleTask(task.id)}
                  style={styles.checkboxTouch}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={task.completed ? theme.colors.success : '#CBD5E1'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < tasks.length - 1 && <View style={styles.taskDivider} />}
            </View>
          ))}

          <TouchableOpacity style={styles.taskFooterLink} activeOpacity={0.7}>
            <Text style={styles.taskFooterLinkText}>Xem lịch chăm sóc</Text>
          </TouchableOpacity>
        </View>

        {/* 8. Mẹo chăm cây hôm nay */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={styles.tipBadge}>
              <Ionicons name="bulb-outline" size={15} color="#2D6A4F" />
              <Text style={styles.tipBadgeText}>Mẹo chăm cây hôm nay</Text>
            </View>
          </View>
          <Text style={styles.tipTitle}>Đất ẩm chưa cần tưới thêm</Text>
          <Text style={styles.tipBody}>
            Tránh tưới quá nhiều nước khi đất vẫn còn ẩm. Nhu cầu nước phụ thuộc vào từng loại cây và điều kiện môi trường.
          </Text>
          <TouchableOpacity style={styles.tipLink} activeOpacity={0.7}>
            <Text style={styles.tipLinkText}>Đọc hướng dẫn ›</Text>
          </TouchableOpacity>
        </View>

        {/* 9. Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherTopRow}>
            <View style={styles.weatherIconContainer}>
              <Ionicons name="partly-sunny" size={36} color="#F39C12" />
            </View>
            <View style={styles.weatherTempContainer}>
              <Text style={styles.weatherTemp}>29°C</Text>
              <Text style={styles.weatherStatus}>Có mây</Text>
            </View>
          </View>

          <View style={styles.weatherBadge}>
            <Ionicons name="information-circle-outline" size={16} color="#2D6A4F" />
            <Text style={styles.weatherBadgeText}>
              Hãy kiểm tra độ ẩm đất trước khi tưới cây hôm nay.
            </Text>
          </View>

          <Text style={styles.weatherFooter}>
            Dữ liệu minh hoạ trong bản mẫu
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* 1. Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    padding: 6,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  /* 2. Greeting */
  greetingSection: {
    marginTop: 10,
    marginBottom: 18,
  },
  greetingSub: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },

  /* 3. AI Banner Card */
  bannerCard: {
    backgroundColor: '#2D6A4F',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#1B4332',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 5,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 8,
  },
  bannerDesc: {
    fontSize: 13,
    color: '#E8F5E9',
    lineHeight: 18,
    marginBottom: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  scanButtonText: {
    color: '#1B4332',
    fontSize: 14,
    fontWeight: '700',
  },
  bannerImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholderAccentCircle: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(82, 183, 136, 0.3)',
  },
  bannerFooterLink: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  bannerFooterLinkText: {
    color: '#D8F3DC',
    fontSize: 13,
    fontWeight: '500',
  },

  /* Section Common */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  /* 4. Khám phá Plantify */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gridIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gridTextContainer: {
    flex: 1,
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  gridCardSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },

  /* 5. Vườn cây của bạn (Stats Card) */
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EEF0F2',
  },
  progressSection: {
    marginTop: 18,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.success,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* 6. Cây của bạn (Horizontal Plant List) */
  plantsHorizontalList: {
    paddingRight: 8,
    gap: 14,
    marginBottom: 24,
  },
  plantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    width: 130,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  plantImageContainer: {
    width: '100%',
    height: 96,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  plantStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  plantStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* 7. Việc cần làm hôm nay (Task List) */
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  taskIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 3,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  taskTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  checkboxTouch: {
    padding: 4,
  },
  taskDivider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 4,
  },
  taskFooterLink: {
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    marginTop: 6,
  },
  taskFooterLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  /* 8. Mẹo chăm cây hôm nay */
  tipCard: {
    backgroundColor: '#EAF5EC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D8EEDD',
  },
  tipHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  tipBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 19,
    marginBottom: 12,
  },
  tipLink: {
    alignSelf: 'flex-start',
  },
  tipLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  /* 9. Weather Card */
  weatherCard: {
    backgroundColor: '#F1F8F4',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0EFE5',
  },
  weatherTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  weatherIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherTempContainer: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  weatherStatus: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 10,
  },
  weatherBadgeText: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '500',
    flex: 1,
  },
  weatherFooter: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
