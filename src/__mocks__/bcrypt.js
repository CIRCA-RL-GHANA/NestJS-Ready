// Jest manual mock for bcrypt — avoids native binary requirement in test environments
const ROUNDS = 10;
const FAKE_HASH_PREFIX = '$2b$10$jestmockhash';

const hash = jest.fn(async (data) => `${FAKE_HASH_PREFIX}.${String(data).slice(0, 16)}`);
const hashSync = jest.fn((data) => `${FAKE_HASH_PREFIX}.${String(data).slice(0, 16)}`);
const compare = jest.fn(async (data, encrypted) =>
  encrypted === `${FAKE_HASH_PREFIX}.${String(data).slice(0, 16)}`,
);
const compareSync = jest.fn((data, encrypted) =>
  encrypted === `${FAKE_HASH_PREFIX}.${String(data).slice(0, 16)}`,
);
const genSalt = jest.fn(async () => '$2b$10$jestsalt');
const genSaltSync = jest.fn(() => '$2b$10$jestsalt');
const getRounds = jest.fn(() => ROUNDS);

module.exports = { hash, hashSync, compare, compareSync, genSalt, genSaltSync, getRounds };
