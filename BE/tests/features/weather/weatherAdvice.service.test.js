jest.mock('../../../src/features/my-garden/userPlant.model', () => ({
  find: jest.fn(),
}));
jest.mock('../../../src/features/weather/weather.service', () => ({
  getWeatherByCity: jest.fn(),
}));

const UserPlant = require('../../../src/features/my-garden/userPlant.model');
const { getWeatherByCity } = require('../../../src/features/weather/weather.service');
const {
  buildWeatherCareAdvice,
  getMyGardenWeatherAdvice,
} = require('../../../src/features/weather/weatherAdvice.service');

function query(result) {
  return {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  };
}

const outdoorPlant = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Hoa hồng',
  catalogPlantId: { tags: ['outdoor'], temperatureMax: 34, temperatureMin: 15 },
};

describe('weather care advice service', () => {
  test('warns outdoor plants to check water in very hot and dry weather', () => {
    const advice = buildWeatherCareAdvice({
      temperature: 38,
      humidity: 35,
      conditionCode: 800,
      cloudiness: 5,
      windSpeed: 2,
    }, [outdoorPlant]);

    expect(advice.map((item) => item.code)).toEqual(expect.arrayContaining([
      'hot_and_dry',
      'strong_sun',
      'above_plant_temperature_limit',
    ]));
    expect(advice.find((item) => item.code === 'hot_and_dry').plantNames)
      .toEqual(['Hoa hồng']);
  });

  test('tells outdoor plants not to water after heavy rain and advises less water in humid weather', () => {
    const advice = buildWeatherCareAdvice({
      temperature: 28,
      humidity: 90,
      rainLastHourMm: 8,
      windSpeed: 1,
    }, [outdoorPlant]);

    expect(advice.map((item) => item.code)).toEqual(expect.arrayContaining([
      'heavy_rain',
      'high_humidity',
    ]));
  });

  test('returns an actionable normal-care recommendation when no weather risk is detected', () => {
    const advice = buildWeatherCareAdvice({
      temperature: 27,
      humidity: 60,
      rainLastHourMm: 0,
      windSpeed: 2,
      cloudiness: 60,
      conditionCode: 803,
    }, [outdoorPlant]);

    expect(advice).toEqual([expect.objectContaining({
      code: 'normal_care',
      plantNames: ['Hoa hồng'],
    })]);
  });

  test('loads the authenticated garden and current city weather', async () => {
    const weather = { temperature: 30, humidity: 60 };
    getWeatherByCity.mockResolvedValue(weather);
    UserPlant.find.mockReturnValue(query([outdoorPlant]));

    const result = await getMyGardenWeatherAdvice(
      '507f1f77bcf86cd799439011',
      'Ho Chi Minh'
    );

    expect(getWeatherByCity).toHaveBeenCalledWith('Ho Chi Minh');
    expect(UserPlant.find).toHaveBeenCalledWith({
      userId: '507f1f77bcf86cd799439011',
      status: 'active',
    });
    expect(result.weather).toBe(weather);
    expect(result.generatedAt).toEqual(expect.any(String));
  });
});
