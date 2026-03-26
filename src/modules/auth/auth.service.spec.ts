import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockOtpService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
    sendOtp: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        password_hash: await bcrypt.hash('password123', 10),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mocked_token');

      const result = await service.login({
        email: 'user@test.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw error on invalid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong' }),
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should create a new user account', async () => {
      const registerDto = {
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: '1', ...registerDto });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', email: 'existing@test.com' });

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
        }),
      ).rejects.toThrow();
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and return tokens', async () => {
      const mockUser = { id: '1', email: 'user@test.com' };
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.verifyOtp('user@test.com', '123456');

      expect(result).toHaveProperty('access_token');
    });

    it('should throw error on invalid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp('user@test.com', '000000')).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens from refresh token', async () => {
      const mockUser = { id: '1', email: 'user@test.com' };
      mockJwtService.verify.mockReturnValue({ sub: '1' });
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_token');

      const result = await service.refreshToken('refresh_token');

      expect(result).toHaveProperty('access_token');
    });
  });
});
