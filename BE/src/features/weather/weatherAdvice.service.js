const UserPlant = require('../my-garden/userPlant.model');
const { getWeatherByCity } = require('./weather.service');

const OUTDOOR_TAGS = new Set(['outdoor', 'ngoai troi', 'ngoài trời']);

/** Chuẩn hóa tag để so khớp không phân biệt dấu/case. @param {*} value - Giá trị tag. @returns {string} Tag chuẩn hóa. */
function normalizeTag(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Kiểm tra cây có thuộc nhóm ngoài trời dựa trên tag catalogue. @param {Object} userPlant - Cây người dùng. @returns {boolean} Kết quả phân loại. */
function isOutdoorPlant(userPlant) {
  const tags = userPlant?.catalogPlantId?.tags || [];
  return tags.some((tag) => OUTDOOR_TAGS.has(normalizeTag(tag)));
}

/** Tạo item khuyến nghị thời tiết với danh sách cây liên quan. @param {Object} data - Dữ liệu khuyến nghị. @returns {Object} Item khuyến nghị. */
function createAdvice({ code, severity, title, message, plants = [] }) {
  return {
    code,
    severity,
    title,
    message,
    plantIds: plants.map((plant) => String(plant._id)),
    plantNames: plants.map((plant) => plant.name),
  };
}

/** Áp dụng các business rule thời tiết để tạo khuyến nghị chăm sóc. @param {Object} weather - Thời tiết chuẩn hóa. @param {Object[]} userPlants - Cây người dùng. @returns {Object[]} Danh sách khuyến nghị. */
function buildWeatherCareAdvice(weather, userPlants) {
  const outdoorPlants = userPlants.filter(isOutdoorPlant);
  const advice = [];
  const temperature = Number(weather.temperature);
  const humidity = Number(weather.humidity);
  const rainMm = Math.max(
    Number(weather.rainLastHourMm || 0),
    Number(weather.rainLastThreeHoursMm || 0) / 3
  );
  const isSunny = [800, 801].includes(Number(weather.conditionCode))
    || Number(weather.cloudiness) <= 25;

  if (outdoorPlants.length && temperature > 37 && humidity <= 40) {
    advice.push(createAdvice({
      code: 'hot_and_dry',
      severity: 'warning',
      title: 'Nắng nóng và khô: kiểm tra nước ngay',
      message: 'Nhiệt độ trên 37°C và độ ẩm thấp. Kiểm tra đất, tưới thêm vào sáng sớm hoặc chiều mát nếu lớp đất mặt đã khô; không tưới giữa trưa.',
      plants: outdoorPlants,
    }));
  }

  if (humidity >= 85) {
    advice.push(createAdvice({
      code: 'high_humidity',
      severity: 'info',
      title: 'Độ ẩm không khí cao: tưới ít hơn',
      message: 'Độ ẩm đang cao. Hãy chỉ tưới khi đất đã khô phù hợp với cây và tăng thông thoáng để hạn chế úng, nấm bệnh.',
      plants: userPlants,
    }));
  }

  if (outdoorPlants.length && rainMm >= 5) {
    advice.push(createAdvice({
      code: 'heavy_rain',
      severity: 'info',
      title: 'Mưa nhiều: chưa cần tưới cây ngoài trời',
      message: `Lượng mưa gần đây khoảng ${rainMm.toFixed(1)} mm/giờ. Tạm không tưới hôm nay, đồng thời kiểm tra chậu/đất có thoát nước tốt hay không.`,
      plants: outdoorPlants,
    }));
  }

  if (outdoorPlants.length && temperature >= 35 && isSunny) {
    advice.push(createAdvice({
      code: 'strong_sun',
      severity: 'warning',
      title: 'Nắng gắt: phòng cháy lá',
      message: 'Nắng mạnh và nhiệt độ cao. Che lưới, di chuyển chậu vào nơi có nắng gián tiếp hoặc tránh nắng trưa để giảm nguy cơ cháy lá.',
      plants: outdoorPlants,
    }));
  }

  if (outdoorPlants.length && Number(weather.windSpeed) >= 10) {
    advice.push(createAdvice({
      code: 'strong_wind',
      severity: 'info',
      title: 'Gió mạnh: cố định chậu và cành',
      message: 'Gió đang mạnh. Cố định chậu/cành, đưa cây non vào chỗ kín gió và kiểm tra đất khô nhanh hơn bình thường.',
      plants: outdoorPlants,
    }));
  }

  const heatSensitivePlants = userPlants.filter((plant) => (
    Number.isFinite(plant.catalogPlantId?.temperatureMax)
    && temperature > plant.catalogPlantId.temperatureMax
  ));
  if (heatSensitivePlants.length) {
    advice.push(createAdvice({
      code: 'above_plant_temperature_limit',
      severity: 'warning',
      title: 'Nhiệt độ vượt ngưỡng phù hợp của cây',
      message: 'Nhiệt độ hiện tại cao hơn ngưỡng catalogue. Ưu tiên làm mát, tăng che chắn và theo dõi dấu hiệu héo/cháy lá.',
      plants: heatSensitivePlants,
    }));
  }

  const coldSensitivePlants = userPlants.filter((plant) => (
    Number.isFinite(plant.catalogPlantId?.temperatureMin)
    && temperature < plant.catalogPlantId.temperatureMin
  ));
  if (coldSensitivePlants.length) {
    advice.push(createAdvice({
      code: 'below_plant_temperature_limit',
      severity: 'warning',
      title: 'Nhiệt độ thấp hơn ngưỡng phù hợp của cây',
      message: 'Chuyển cây nhạy cảm vào chỗ ấm hơn, tránh gió lùa và không tưới quá nhiều khi cây hấp thụ nước chậm.',
      plants: coldSensitivePlants,
    }));
  }

  if (advice.length === 0) {
    advice.push(createAdvice({
      code: 'normal_care',
      severity: 'info',
      title: 'Thời tiết ổn định: chăm sóc theo lịch hôm nay',
      message: 'Không có dấu hiệu nắng nóng, mưa lớn hay ẩm quá cao. Hãy kiểm tra đất trước khi tưới: chỉ tưới khi lớp đất mặt đã khô và tiếp tục theo lịch chăm sóc của từng cây.',
      plants: userPlants,
    }));
  }

  return advice;
}

/** Lấy thời tiết, cây người dùng và xây dựng khuyến nghị My Garden. @param {string} userId - ID người dùng. @param {string} city - Thành phố. @returns {Promise<Object>} Thời tiết và danh sách khuyến nghị. */
async function getMyGardenWeatherAdvice(userId, city) {
  const [weather, userPlants] = await Promise.all([
    getWeatherByCity(city),
    UserPlant.find({ userId, status: 'active' })
      .populate('catalogPlantId', 'tags temperatureMin temperatureMax')
      .lean(),
  ]);

  return {
    weather,
    advice: buildWeatherCareAdvice(weather, userPlants),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildWeatherCareAdvice,
  getMyGardenWeatherAdvice,
  isOutdoorPlant,
};
