import { componentStyles } from "../../../theme/componentStyles";
import { Button, Card } from "react-native-paper";

import { styles } from "./presentation";
import TopupOrderSummary from "./TopupOrderSummary";
export default function WalletOrder({ order, onClose }) {
  return <Card style={styles.card}><Card.Content style={styles.gap}>
    <TopupOrderSummary order={order} />
    <Button style={componentStyles.buttonShape} contentStyle={componentStyles.button} onPress={onClose}>Đóng thông tin đơn</Button>
  </Card.Content></Card>;
}
