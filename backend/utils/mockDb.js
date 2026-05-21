const mockUsers = [];
const mockSettings = [];
const mockSummaries = [];

const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = {
  mockUsers,
  mockSettings,
  mockSummaries,
  generateId
};
