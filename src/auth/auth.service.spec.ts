import { Test, TestingModule } from '@nestjs/testing';
import AuthService from './auth.service';
import UsersService from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto';
import { User } from 'src/users/entities';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            resetPasswordRequest: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a user and access token if credentials are valid', async () => {
      const signInDto: SignInDto = {
        email: 'abc@gmail.com',
        password: '12345678',
      };
      const user: User = {
        id: 1,
        email: 'abc@gmail.com',
        firstName: 'First',
        lastName: 'Last',
        resetToken: null,
        resetTokenExpiration: null,
        validatePassword: jest.fn().mockResolvedValue(true),
        password: '12345678',
      };
      const accessToken = 'testToken';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(accessToken);

      const result = await authService.signIn(signInDto);
      expect(result.user).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(await authService.signIn(signInDto)).toBeDefined();
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
      expect(user.validatePassword).toHaveBeenCalledWith(
        signInDto.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        username: user.email,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const signInDto: SignInDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const signInDto: SignInDto = {
        email: 'test@example.com',
        password: 'invalidpassword',
      };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        firstName: 'First',
        lastName: 'Last',
        resetToken: null,
        resetTokenExpiration: null,
        validatePassword: jest.fn().mockResolvedValue(false),
        password: '1password123',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
