import SearchField from "../../common/SearchField";
import { componentStyles } from "../../../theme/componentStyles";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { styles } from "./presentation";
import { amountError } from "../../../utils/financeValidation";
export default function AdminAdjustment({
  f,
  search,
  setSearch,
  setCustomer,
  findCustomers,
  searchError,
  customers,
  customer,
  amount,
  setAmount,
  setValidationError,
  setReason,
  setDialog,
}) {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.gap}>
        <Text variant="titleMedium">Cộng số dư thủ công</Text>
        <SearchField
          placeholder="Tìm khách hàng theo tên hoặc email…" accessibilityLabel="Tìm khách hàng theo tên hoặc email"
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            setCustomer(null);
          }}
        />
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} disabled={f.busy} onPress={findCustomers}>
          Tìm người dùng
        </Button>
        {!!searchError && <Text>{searchError}</Text>}
        {customers.map((u) => (
          <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
            key={u._id}
            mode={customer?._id === u._id ? "contained" : "text"}
            onPress={() => setCustomer(u)}
          >
            {u.fullName} · {u.email}
          </Button>
        ))}
        <TextInput
          label="Số tiền cộng (VND)"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
          disabled={f.busy}
        />
        <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
          disabled={f.busy}
          onPress={() => {
            const invalid = !customer
              ? "Vui lòng tìm và chọn người dùng cần cộng tiền."
              : amountError(amount);
            if (invalid) setValidationError(invalid);
            else {
              setReason("");
              setDialog({
                adjust: true,
              });
            }
          }}
        >
          Tiếp tục cộng tiền
        </Button>
      </Card.Content>
    </Card>
  );
}
