const walletService = require('./wallet.service');
const { success, error } = require('../../utils/apiResponse');

async function getMyWallet(req, res) {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    return success(res, 'Lấy thông tin ví thành công', wallet);
  } catch (err) {
    console.error('[Wallet] Lỗi lấy thông tin ví:', err);
    return error(res, 'Không thể lấy thông tin ví', 500);
  }
}

module.exports = { getMyWallet };
