import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import UsersService from '../users/users.service';
import { CreateUserDto, CreateUserDto as RegisterUserDto } from '../users/dto';
import { SignInDto, ResetPasswordDto, ResetPasswordRequestDto } from './dto';

describe('AuthController', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            resetPasswordRequest: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/POST auth/sign-up', async () => {
    const registerUserDto: CreateUserDto = { email: 'test@test.com', password: 'password', firstName: "First", lastName: "Last" };

    const response = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(registerUserDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toBeTruthy();
  });

  it('/POST auth/sign-in', async () => {
    const signInDto: SignInDto = { email: 'test@test.com', password: 'password' };

    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(signInDto)
      .expect(HttpStatus.OK);

    expect(response.body).toBeTruthy();
  });

  it('/POST auth/reset-password', async () => {
    const resetPasswordRequestDto: ResetPasswordRequestDto = { email: 'test@test.com' };
    const result = { data: { message: 'Email sent' } };
    jest.spyOn(authService, 'resetPasswordRequest').mockImplementation(async () => result);

    const response = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send(resetPasswordRequestDto)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(result);
  });

  it('/POST auth/reset-password/:token', async () => {
    const resetPasswordDto: ResetPasswordDto = { password: 'newPassword', confirmPassword: 'newPassword' };
    const result = { status: true, message: 'Password changed' };
    jest.spyOn(authService, 'resetPassword').mockImplementation(async () => result);

    const response = await request(app.getHttpServer())
      .post('/auth/reset-password/token123')
      .send(resetPasswordDto)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual(result);
  });
});

