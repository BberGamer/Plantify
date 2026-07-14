// tests/mocks/mongoose.js
function createQueryChainMock({ findResult = [], countResult = 0 } = {}) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn(() => Promise.resolve(findResult)),
    exec: jest.fn(() => Promise.resolve(findResult)),
  };
  chain.then = (resolve) => Promise.resolve(findResult).then(resolve);

  const Model = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({ _id: 'mockId' }),
  }));

  Model.find = jest.fn(() => chain);
  Model.findOne = jest.fn(() => chain);
  Model.findById = jest.fn(() => chain);
  Model.findOneAndUpdate = jest.fn(() => chain);
  Model.findOneAndDelete = jest.fn(() => chain);
  Model.findByIdAndUpdate = jest.fn(() => chain);
  Model.findByIdAndDelete = jest.fn(() => chain);
  Model.countDocuments = jest.fn(() => Promise.resolve(countResult));
  Model.create = jest.fn((data) => Promise.resolve({ _id: 'mockId', ...data }));
  Model.aggregate = jest.fn(() => Promise.resolve(findResult));

  return { Model, chain };
}

function buildModelMock(options = {}) {
  const { Model } = createQueryChainMock(options);
  return Model;
}

module.exports = {
  createQueryChainMock,
  buildModelMock,
};