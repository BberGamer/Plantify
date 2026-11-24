import StatusBadge from "../../common/StatusBadge";
import ListPagination from "../../common/ListPagination";
import { componentStyles } from "../../../theme/componentStyles";
import { View } from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";
import { money, date, labels, toneFor, styles } from "./presentation";
import { FilterChip, FilterRow } from "../../common/FilterControls";
export default function HistorySection({ f, admin, setReason, setDialog }) {
  return (
    <>
      <FilterRow>
        {["orders", "transactions", ...(admin ? ["events"] : [])].map(
          (kind) => (
            <FilterChip
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
            </FilterChip>
          ),
        )}
      </FilterRow>
      <FilterRow>
        {[
          "",
          ...(f.kind === "orders"
            ? ["pending", "success", "rejected"]
            : f.kind === "events"
              ? ["review", "credited", "already_processed"]
              : ["topup", "purchase", "adjustment"]),
        ].map((value) => (
          <FilterChip
            key={value}
            selected={f.filter === value}
            disabled={f.busy}
            onPress={() => f.selectFilter(value)}
          >
            {labels[value] || "Tất cả"}
          </FilterChip>
        ))}
      </FilterRow>
      <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} disabled={f.busy} onPress={f.refresh} icon="refresh">
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
                <StatusBadge label={labels[status] || "Đã ghi nhận"} tone={{ color: statusTone.text, background: statusTone.border }} />
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
                  <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
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
                  <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
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
                <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
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
      <ListPagination pagination={{ page: f.page, totalPages: f.list.totalPages,
        hasPrevPage: f.page > 1, hasNextPage: f.page < f.list.totalPages }}
        disabled={f.busy} onPageChange={f.changePage} />
    </>
  );
}
