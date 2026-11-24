import { componentStyles } from "../../../theme/componentStyles";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { money, styles } from "./presentation";
export default function VipSection({ f, router, setDialog }) {
  return (
    <>
      <Text variant="titleLarge" style={styles.heading}>
        {f.summary?.isproaccount ? "Gia hạn gói VIP" : "Chọn gói VIP"}
      </Text>
      {f.summary?.plans?.map((plan) => (
        <Card key={plan.code} style={styles.card}>
          <Card.Content style={styles.row}>
            <View style={styles.flex}>
              <Text variant="titleMedium">{plan.name}</Text>
              <Text>
                {plan.days} ngày · {money(plan.price)}
              </Text>
            </View>
            <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button}
              mode="contained"
              disabled={f.busy}
              onPress={() => {
                if (f.summary.balance < plan.price)
                  router.push({
                    pathname: "/customer/wallet",
                    params: {
                      amount: String(
                        Math.max(10000, plan.price - f.summary.balance),
                      ),
                    },
                  });
                else
                  setDialog({
                    plan,
                  });
              }}
            >
              {f.summary.balance < plan.price
                ? "Nạp để mua"
                : f.summary.isproaccount
                  ? "Gia hạn"
                  : "Mua gói"}
            </Button>
          </Card.Content>
        </Card>
      ))}
    </>
  );
}
