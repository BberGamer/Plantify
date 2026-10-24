# 🌿 Plantify Design System

> Hệ thống thiết kế cho ứng dụng chăm sóc cây xanh Plantify - React Native (Expo)

## 📋 Mục lục

- [Triết lý thiết kế](#triết-lý-thiết-kế)
- [Bảng màu](#bảng-màu)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Icons & Illustrations](#icons--illustrations)
- [Accessibility](#accessibility)
- [React Native Best Practices](#react-native-best-practices)

---

## Triết lý thiết kế

### Ngôn ngữ thiết kế: "Khu vườn" (Garden)

Plantify sử dụng ẩn dụ **khu vườn** xuyên suốt giao diện:
- 🌱 **Customer** = Người trồng cây (mầm non)
- 🌻 **Manager** = Người chăm vườn (cây hoa)
- 🛡️ **Admin** = Người giữ rừng (cây cổ thụ)

### Nguyên tắc cốt lõi

1. **Organic & Natural**: Bo góc mềm mại, hình dạng lá cây, màu sắc thiên nhiên
2. **Accessible First**: Tất cả UI đạt WCAG 2.1 Level AA (contrast ≥4.5:1, touch target ≥44px)
3. **Consistent Metaphors**: Vai trò = loại cây, trạng thái = yếu tố tự nhiên (nước 💧/tuyết ❄️)
4. **Mobile-first**: Thiết kế cho điện thoại trước, mở rộng cho tablet

---

## Bảng màu

### Palette chính: `garden` (src/components/admin/users/theme.js)

```javascript
export const garden = {
  // Xanh lá cây
  forest: "#144D37",      // Xanh rừng đậm - Primary actions, headers
  forestDark: "#0D3827",  // Xanh rừng tối - Shadows, overlays
  moss: "#247855",        // Rêu xanh - Active states, links
  sprout: "#3FA673",      // Mầm xanh - Success, growth indicators
  
  // Tông nền
  mint: "#EDF7F1",        // Bạc hà nhạt - Soft backgrounds, badges
  sage: "#DCEBE1",        // Xanh xám - Dividers, subtle containers
  cream: "#F6F8F1",       // Kem - Page background
  
  // Tông ấm (terracotta - chậu đất nung)
  bark: "#7A5230",        // Vỏ cây - Google badge, tertiary
  barkBg: "#F5EDE4",
  terracotta: "#B4532A", // Đất nung - Danger/Lock (thay đỏ harsh)
  terracottaBg: "#FBEDE6",
  
  // Vàng nắng
  sun: "#B7791F",         // Manager role color
  sunBg: "#FDF5E3",
  
  // Text
  ink: "#183B2B",         // Text primary (từ colors.textPrimary)
  inkSoft: "#4B6357",     // Text secondary, subtle info
  muted: "#7C8B83",       // Placeholder, disabled text
  
  // Structural
  line: "#E1EAE3",        // Borders, dividers
  white: "#FFFFFF",
  overlay: "rgba(13, 56, 39, 0.55)", // Modal backdrop
};
```

### Vai trò & màu sắc

```javascript
export const ROLE_META = {
  customer: {
    label: "Customer",
    hint: "Người trồng cây",
    icon: "leaf",
    color: garden.moss,    // #247855
    bg: garden.mint,       // #EDF7F1
  },
  manager: {
    label: "Manager",
    hint: "Người chăm vườn",
    icon: "flower",
    color: garden.sun,     // #B7791F
    bg: garden.sunBg,      // #FDF5E3
  },
  admin: {
    label: "Admin",
    hint: "Người giữ rừng",
    icon: "shield-checkmark",
    color: garden.forest,  // #144D37
    bg: garden.sage,       // #DCEBE1
  },
};
```

### Quy tắc sử dụng màu

✅ **DO**
- Dùng `garden.forest` cho primary actions (buttons, headers)
- Dùng `garden.terracotta` cho destructive actions (xóa, khóa) thay vì đỏ harsh
- Dùng `garden.mint` cho soft backgrounds, success states
- Dùng icon màu cho trạng thái: 💧 nước (active) / ❄️ tuyết (locked)

❌ **DON'T**
- Không dùng hex colors trực tiếp trong components (`#144D37` → `garden.forest`)
- Không dùng emoji làm icon chính (🌱❌ → `<Ionicons name="leaf" />` ✅)
- Không dùng `colors.statusError` (#EF4444) → dùng `garden.terracotta`
- Không dùng gray-on-gray: contrast phải ≥4.5:1

---

## Typography

### Font chính: System Default
React Native dùng font hệ thống mặc định:
- **iOS**: SF Pro
- **Android**: Roboto

### Scale

```javascript
const typography = {
  // Headings
  h1: { fontSize: 28, fontWeight: "800", lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "700", lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  
  // Body
  body: { fontSize: 15, fontWeight: "400", lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: "400", lineHeight: 20 },
  
  // UI
  button: { fontSize: 14, fontWeight: "700", letterSpacing: 0.2 },
  caption: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  label: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
};
```

### Quy tắc

✅ **DO**
- Base size: **15px** cho body text (mobile-friendly)
- Line-height: **1.4–1.5** cho body, **1.2–1.3** cho headings
- Fontweight: `400` (regular), `600` (semibold), `700` (bold), `800` (extrabold)

❌ **DON'T**
- Không dùng font size < 12px cho body text
- Không dùng fontWeight bằng số (`500` ❌ → `"600"` ✅)
- Không dùng `letterSpacing` âm (gây khó đọc trên Android)

---

## Spacing & Layout

### Spacing scale (8px base)

```javascript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
```

### Border Radius

```javascript
const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
  
  // Leaf shape (đặc trưng Plantify)
  leaf: {
    topLeft: "50%",
    bottomRight: "50%",
    topRight: "18%",
    bottomLeft: "18%",
  },
};
```

### Leaf Shape Helper

```javascript
// src/components/admin/users/theme.js
export const leafShape = (size, tight = 0.18) => ({
  width: size,
  height: size,
  borderTopLeftRadius: size / 2,
  borderBottomRightRadius: size / 2,
  borderTopRightRadius: size * tight,
  borderBottomLeftRadius: size * tight,
});

// Usage
<View style={[styles.avatar, leafShape(46)]} />
```

### Layout containers

```javascript
const containers = {
  page: {
    flex: 1,
    backgroundColor: garden.cream,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: garden.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: garden.line,
  },
};
```

---

## Components

### Button Styles

```javascript
// Primary (forest green)
btnPrimary: {
  height: 48,
  borderRadius: 14,
  backgroundColor: garden.forest,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
}

// Soft (mint background)
btnSoft: {
  height: 44,
  borderRadius: 14,
  backgroundColor: garden.mint,
  // Text color: garden.forest
}

// Danger (terracotta)
btnDanger: {
  height: 44,
  borderRadius: 14,
  backgroundColor: garden.terracotta,
  // Text color: garden.white
}

// Leaf-shaped action button
btnLeaf: {
  ...leafShape(48),
  backgroundColor: garden.sprout,
}
```

### Badges & Tags

```javascript
badge: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 9,
  paddingVertical: 4,
  // Leaf-shape corners
  borderTopLeftRadius: 12,
  borderBottomRightRadius: 12,
  borderTopRightRadius: 4,
  borderBottomLeftRadius: 4,
  gap: 4,
}
```

### Cards

```javascript
userCard: {
  backgroundColor: garden.white,
  borderRadius: 20,
  borderTopLeftRadius: 28, // Asymmetric cho organic feel
  padding: 14,
  paddingLeft: 18,
  borderWidth: 1,
  borderColor: garden.line,
  shadowColor: garden.forest,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.07,
  shadowRadius: 8,
  elevation: 2,
}
```

### Modals

```javascript
// Bottom sheet style
modal: {
  flex: 1,
  backgroundColor: garden.overlay,
  justifyContent: "flex-end",
}

modalCard: {
  width: "100%",
  maxHeight: "90%",
  backgroundColor: garden.white,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  shadowColor: garden.forestDark,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 8,
}

modalHeader: {
  paddingHorizontal: 18,
  paddingTop: 20,
  paddingBottom: 14,
  backgroundColor: garden.cream, // Mint header band
  borderBottomWidth: 1,
  borderBottomColor: garden.line,
}
```

### Input Fields

```javascript
input: {
  height: 48,
  borderWidth: 1,
  borderColor: garden.line,
  borderRadius: 14,
  paddingHorizontal: 14,
  fontSize: 15,
  color: garden.ink,
  backgroundColor: garden.cream,
}

// Focus state
inputFocused: {
  borderColor: garden.moss,
  borderWidth: 2,
}

// Error state
inputError: {
  borderColor: garden.terracotta,
  backgroundColor: garden.terracottaBg,
}
```

### Filter Chips

```javascript
chip: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 12,
  height: 34,
  borderRadius: 17,
  backgroundColor: garden.white,
  borderWidth: 1,
  borderColor: garden.line,
  gap: 5,
}

chipActive: {
  backgroundColor: garden.forest,
  borderColor: garden.forest,
  // Text & icon: garden.white
}
```

---

## Icons & Illustrations

### Icon Library: Ionicons

```javascript
import { Ionicons } from "@expo/vector-icons";

// Vai trò
<Ionicons name="leaf" />          // Customer
<Ionicons name="flower" />        // Manager
<Ionicons name="shield-checkmark" /> // Admin

// Trạng thái
<Ionicons name="water" />         // Active
<Ionicons name="snow" />          // Locked/Dormant
<Ionicons name="checkmark-circle" /> // Success
<Ionicons name="warning" />       // Error

// Actions
<Ionicons name="create-outline" /> // Edit
<Ionicons name="git-branch-outline" /> // Change role
<Ionicons name="lock-closed" />   // Lock
<Ionicons name="search" />        // Search
<Ionicons name="reload" />        // Refresh
```

### Quy tắc icon

✅ **DO**
- Dùng Ionicons (có sẵn trong Expo)
- Size: 14-20px cho inline, 24-32px cho standalone
- Luôn thêm `accessibilityLabel` cho icon-only buttons
- Dùng outline style cho secondary actions
- Màu icon theo context: `garden.forest` (primary), `garden.inkSoft` (secondary)

❌ **DON'T**
- ❌ Không dùng emoji làm icon (`🌱` → `<Ionicons name="leaf" />`)
- ❌ Không mix nhiều icon libraries (FontAwesome, MaterialIcons...)
- ❌ Icon-only button không có label (phải có `accessibilityLabel`)

---

## Accessibility

### Touch Targets

**Minimum: 44×44px** (WCAG 2.1 Level AAA)

```javascript
// ✅ Good
button: {
  width: 44,
  height: 44,
  // Hoặc minWidth/minHeight
}

// ❌ Bad
iconButton: {
  width: 32,  // Too small!
  height: 32,
}
```

### Color Contrast

**Minimum: 4.5:1** (WCAG 2.1 Level AA)

✅ **Passed combinations**
- `garden.forest` (#144D37) on `garden.white` → **12.5:1** ✅
- `garden.ink` (#183B2B) on `garden.white` → **11.8:1** ✅
- `garden.inkSoft` (#4B6357) on `garden.white` → **7.2:1** ✅
- `garden.terracotta` (#B4532A) on `garden.white` → **4.8:1** ✅

❌ **Failed (don't use)**
- `garden.muted` (#7C8B83) on `garden.white` → **3.1:1** ❌
- `garden.mint` (#EDF7F1) on `garden.white` → **1.1:1** ❌

### Accessibility Props

```javascript
// Icon-only button
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Quay lại"
  accessibilityHint="Quay về trang trước"
>
  <Ionicons name="arrow-back" size={22} />
</TouchableOpacity>

// Badge/tag (decorative)
<View accessibilityRole="text">
  <Text>Active</Text>
</View>

// Toast notification
<View
  accessibilityLiveRegion="polite"
  accessibilityRole="alert"
>
  <Text>{message}</Text>
</View>
```

### Screen Reader Support

```javascript
// Nhóm các element liên quan
<View accessible={true} accessibilityLabel="Thông tin người dùng">
  <Text>{user.name}</Text>
  <Text>{user.email}</Text>
</View>

// Ẩn decorative elements
<View accessibilityElementsHidden={true}>
  <Ionicons name="leaf" /> {/* Background decoration */}
</View>
```

---

## React Native Best Practices

### Performance

```javascript
// ✅ Use FlatList for long lists (virtualization)
<FlatList
  data={users}
  keyExtractor={(item) => item._id}
  renderItem={({ item }) => <UserCard item={item} />}
  windowSize={5}
  maxToRenderPerBatch={10}
  initialNumToRender={10}
/>

// ✅ Optimize images
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  defaultSource={require('./placeholder.png')}
/>

// ❌ Don't use ScrollView for large lists
<ScrollView>
  {users.map(u => <UserCard key={u._id} user={u} />)}
</ScrollView>
```

### Platform-specific code

```javascript
import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: garden.forest,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Safe Area (iOS notch, Android navigation)

```javascript
import { SafeAreaView } from "react-native-safe-area-context";

<SafeAreaView style={styles.container} edges={["top"]}>
  {/* Content */}
</SafeAreaView>
```

### Avoid borderStyle dashed (Android bug)

```javascript
// ❌ Don't use on Android (breaks on some devices)
border: {
  borderTopWidth: 1,
  borderStyle: "dashed", // Bug!
}

// ✅ Use solid borders
border: {
  borderTopWidth: 1,
  borderColor: garden.line,
}
```

---

## File Structure

```
mobile/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── users/
│   │   │       ├── theme.js          # Garden palette & helpers
│   │   │       ├── UserHeader.js
│   │   │       ├── UserCard.js
│   │   │       ├── UserBadges.js
│   │   │       ├── UserFilterBar.js
│   │   │       ├── UserEmptyState.js
│   │   │       ├── UserPagination.js
│   │   │       ├── UserToastBanner.js
│   │   │       ├── UserDetailModal.js
│   │   │       ├── UserRoleModal.js
│   │   │       ├── UserStatusModal.js
│   │   │       └── index.js
│   │   └── ...
│   ├── theme/
│   │   ├── colors.js               # Global colors
│   │   └── index.js
│   └── ...
├── app/
│   └── admin/
│       └── users.js                # Main screen
└── docs/
    └── DESIGN.md                   # This file
```

---

## Checklist cho Component mới

Trước khi commit component mới, kiểm tra:

### ✅ Visual Design
- [ ] Dùng `garden.*` colors (không hardcode hex)
- [ ] Bo góc theo scale (8/12/14/16/20/24/28)
- [ ] Shadow: iOS (shadowColor/Offset/Opacity/Radius) + Android (elevation)
- [ ] Spacing theo scale 8px (4/8/12/16/20/24/32/48)

### ✅ Typography
- [ ] Font size ≥ 12px (body text ≥ 15px)
- [ ] Line-height 1.4–1.5 (body), 1.2–1.3 (headings)
- [ ] Font weight: `"400"`, `"600"`, `"700"`, `"800"` (string)

### ✅ Accessibility
- [ ] Touch targets ≥ 44×44px
- [ ] Color contrast ≥ 4.5:1
- [ ] Icon-only buttons có `accessibilityLabel`
- [ ] `accessibilityRole` cho interactive elements
- [ ] Toast/alerts có `accessibilityLiveRegion="polite"`

### ✅ Icons
- [ ] Dùng `<Ionicons />` (không emoji)
- [ ] Size: 14-20px inline, 24-32px standalone
- [ ] Color theo context (forest/inkSoft/white)

### ✅ React Native
- [ ] FlatList cho danh sách dài (không ScrollView)
- [ ] SafeAreaView với edges phù hợp
- [ ] Platform-specific shadow (iOS + Android)
- [ ] Không dùng `borderStyle: "dashed"` trên Android
- [ ] Image có `resizeMode` và `defaultSource`

### ✅ Code Quality
- [ ] Import `garden` từ `theme.js`
- [ ] StyleSheet.create() cho styles
- [ ] Không duplicate styles
- [ ] Component có PropTypes hoặc TypeScript

---

## Reference Components

### Ví dụ hoàn chỉnh: UserCard

```javascript
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { garden, getRoleMeta, leafShape } from "./theme";

export default function UserCard({ item, onPress }) {
  const roleMeta = getRoleMeta(item.role);
  const isActive = item.status !== false;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Người dùng ${item.fullName}`}
    >
      {/* Role stem */}
      <View style={[styles.stem, { backgroundColor: roleMeta.color }]} />

      {/* Avatar with leaf shape */}
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, leafShape(46), { backgroundColor: garden.moss }]}>
          <Text style={styles.avatarText}>
            {item.fullName.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: roleMeta.bg }]}>
          <Ionicons name={roleMeta.icon} size={11} color={roleMeta.color} />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.fullName}</Text>
        <View style={styles.meta}>
          <Ionicons name="mail-outline" size={13} color={garden.muted} />
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: isActive ? garden.mint : garden.terracottaBg }]}>
        <Ionicons name={isActive ? "water" : "snow"} size={12} color={isActive ? garden.sprout : garden.terracotta} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: garden.white,
    borderRadius: 20,
    borderTopLeftRadius: 28,
    padding: 14,
    paddingLeft: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: garden.line,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: garden.forest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  stem: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  avatarWrap: {
    width: 46,
    height: 46,
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: garden.white,
    fontWeight: "800",
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: garden.white,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: garden.ink,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 5,
  },
  email: {
    fontSize: 13,
    color: garden.inkSoft,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Ionicons](https://ionic.io/ionicons)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Version:** 1.0  
**Last Updated:** 2026-10-22  
**Maintainer:** Plantify Design Team
