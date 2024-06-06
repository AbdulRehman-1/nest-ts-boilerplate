import { Test, TestingModule } from "@nestjs/testing";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import UsersService from "../users/users.service";
import { CreateUserDto } from "../users/dto";
import { SignInDto, ResetPasswordDto, ResetPasswordRequestDto } from "./dto";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        // {
        //   provide: AuthService,
        //   useValue: {
        //     signIn: jest.fn(),
        //     resetPasswordRequest: jest.fn(),
        //     resetPassword: jest.fn(),
        //   },
        // },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(authController).toBeDefined();
  });

  describe("signUp", () => {
    it("should call usersService.createUser with correct parameters", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@test.com",
        password: "password",
        firstName: "First",
        lastName: "Last",
      };
      await authController.signUp(createUserDto);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("signIn", () => {
    it("should call authService.signIn with correct parameters", async () => {
      const signInDto: SignInDto = {
        email: "test@test.com",
        password: "password",
      };
      await authController.signIn(signInDto);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe("resetPasswordRequest", () => {
    it("should call authService.resetPasswordRequest with correct parameters", async () => {
      const resetPasswordRequestDto: ResetPasswordRequestDto = {
        email: "test@test.com",
      };
      await authController.resetPasswordRequest(resetPasswordRequestDto);
      expect(authService.resetPasswordRequest).toHaveBeenCalledWith(
        resetPasswordRequestDto
      );
    });
  });

  describe("resetPassword", () => {
    it("should call authService.resetPassword with correct parameters", async () => {
      const token = "reset-token";
      const newPasswordDto: ResetPasswordDto = {
        password: "newpassword",
        confirmPassword: "newpassword",
      };
      await authController.resetPassword(newPasswordDto, token);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        newPasswordDto,
        token,
        "user"
      );
    });
  });
});
