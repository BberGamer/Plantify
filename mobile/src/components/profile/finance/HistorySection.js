import { View } from "react-native";
import { Button, Card, Chip, Icon, Text } from "react-native-paper";
import { money, date, labels, tones, toneFor, styles } from "./presentation";
function FinanceChip({ selected, tone = tones.green, children, ...props }) {
  return (
    <Chip
      {...props}
      selected={selected}
      showSelectedOverlay={false}
      selectedColor={selected ? "#FFFFFF" : tone.text}
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? tone.text : tone.background,
          borderColor: tone.border,
        },
      ]}
      textStyle={{
        color: selected ? "#FFFFFF" : tone.text,
        fontWeight: selected ? "700" : "500",
      }}
    >
      {children}
    </Chip>
  );
}
export default function HistorySection({ f, admin, setReason, setDialog }) {
  return (
    <>
      <View style={styles.wrap}>
        {["orders", "transactions", ...(admin ? ["events"] : [])].map(
          (kind) => (
            <FinanceChip
              key={kind}
              selected={f.kind === kind}
              disabled={f.busy}
              onPress={() => f.selectKind(kind)}
            >
              {
                {
                  orders: "Đơn nạp",
                  transactions: "Lịch sử",
                  events: "SePay / Đối soát",
                }[kind]
              }
            </FinanceChip>
          ),
        )}
      </View>
      <View style={styles.wrap}>
        {[
          "",
          ...(f.kind === "orders"
            ? ["pending", "success", "rejected"]
            : f.kind === "events"
              ? ["review", "credited", "already_processed"]
              : ["topup", "purchase", "adjustment"]),
        ].map((value) => (
          <FinanceChip
            key={value}
            tone={value ? toneFor(value) : tones.green}
            selected={f.filter === value}
            disabled={f.busy}
            onPress={() => f.selectFilter(value)}
          >
            {labels[value] || "Tất cả"}
          </FinanceChip>
        ))}
      </View>
      <Button disabled={f.busy} onPress={f.refresh} icon="refresh">
        Tải lại
      </Button>
      {!f.loading && !f.list.items.length && (
        <Text>Chưa có giao dịch trong mục này.</Text>
      )}
      {f.list.items.map((item) => {
        const status = item.expired ? "expired" : item.status;
        const tone = toneFor(f.kind === "transactions" ? item.type : status);
        const statusTone = status ? toneFor(status) : tone;
        return (
          <Card
            key={item._id}
            mode="outlined"
            style={[
              styles.card,
              styles.transactionCard,
              {
                backgroundColor: tone.background,
                borderColor: tone.border,
                borderLeftColor: tone.text,
              },
            ]}
          >
            <Card.Content style={styles.transactionContent}>
              <View style={styles.transactionHeading}>
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor: tone.border,
                    },
                  ]}
                >
                  <Icon source={tone.icon} color={tone.text} size={18} />
                </View>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.flex,
                    styles.transactionTitle,
                    {
                      color: tone.text,
                    },
                  ]}
                >
                  {item.code ||
                    labels[item.type] ||
                    `SePay #${item.provider_id}`}{" "}
                  {item.plan || ""}
                </Text>
              </View>
              <View style={styles.row}>
                <Text
                  variant="headlineSmall"
                  style={[
                    styles.transactionAmount,
                    {
                      color: tone.text,
                    },
                  ]}
                >
                  {f.kind === "transactions" && item.amount > 0 ? "+" : ""}
                  {money(item.amount)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusTone.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: statusTone.text,
                      },
                    ]}
                  >
                    {labels[status] || "Đã ghi nhận"}
                  </Text>
                </View>
              </View>
              <Text style={styles.secondaryText}>
                {date(item.createdAt || item.created_at)}
              </Text>
              {admin && (
                <Text selectable>User: {item.user_id || "Chưa xác định"}</Text>
              )}
              {item.balance_after !== undefined && (
                <View
                  style={[
                    styles.balanceRow,
                    {
                      borderTopColor: tone.border,
                    },
                  ]}
                >
                  <Text style={styles.secondaryText}>Số dư sau giao dịch</Text>
                  <Text style={styles.balanceValue}>
                    {money(item.balance_after)}
                  </Text>
                </View>
              )}
              {!!item.reason && <Text>{item.reason}</Text>}
              {admin && item.actor_id && (
                <Text selectable>Người thực hiện: {item.actor_id}</Text>
              )}
              {admin && item.reviewed_by && (
                <Text selectable>Admin: {item.reviewed_by}</Text>
              )}
              {f.kind === "events" && <Text selectable>{item.content}</Text>}
              {admin && f.kind === "orders" && item.status === "pending" && (
                <View style={styles.row}>
                  <Button
                    disabled={f.busy}
                    onPress={() => {
                      setReason("");
                      setDialog({
                        id: item._id,
                        status: "success",
                        amount: item.amount,
                      });
                    }}
                  >
                    Duyệt cộng ví
                  </Button>
                  <Button
                    disabled={f.busy}
                    textColor="#B42318"
                    onPress={() => {
                      setReason("");
                      setDialog({
                        id: item._id,
                        status: "rejected",
                      });
                    }}
                  >
                    Từ chối
                  </Button>
                </View>
              )}
              {!admin && f.kind === "orders" && (
                <Button
                  disabled={f.busy}
                  onPress={() => {
                    f.openOrder(item);
                    setDialog({
                      view: item,
                    });
                  }}
                >
                  Xem đơn
                </Button>
              )}
            </Card.Content>
          </Card>
        );
      })}
      <View style={styles.row}>
        <Button
          disabled={f.page <= 1 || f.busy}
          onPress={() => f.changePage(f.page - 1)}
        >
          Trước
        </Button>
        <Text>
          Trang {f.page}/{Math.max(1, f.list.totalPages)}
        </Text>
        <Button
          disabled={f.page >= f.list.totalPages || f.busy}
          onPress={() => f.changePage(f.page + 1)}
        >
          Sau
        </Button>
      </View>
    </>
  );
}
