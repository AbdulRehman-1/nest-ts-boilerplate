import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ResetPasswordDto, ResetPasswordRequestDto, SignInDto } from "./dto";
import { JwtService } from "@nestjs/jwt";
import UsersService from "../users/users.service";
import * as crypto from "crypto";

@Injectable()
export default class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("Invalid username or password");
    }
    const passwordIsValid = await user.validatePassword(password);
    if (!passwordIsValid) {
      throw new UnauthorizedException("Invalid password");
    }

    const payload = { sub: user.id, username: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    delete user["password"];
    return { user, access_token: accessToken };
  }

  async resetPasswordRequest(forgetPasswordDto: ResetPasswordRequestDto) {
    const { email } = forgetPasswordDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User does not exist");
    }
    const token = crypto.randomBytes(16).toString("hex");
    const saved = await this.usersService.resetPasswordRequest(token, user);
    if (saved)
      return {
        data: {
          message: "Email sent",
        },
      };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
    userType: string
  ) {
    const { password, confirmPassword } = resetPasswordDto;
    if (password !== confirmPassword) {
      throw new UnauthorizedException("Password must be matched!");
    }
    const changePassword = await this.usersService.resetPassword(
      token,
      password
    );
    if (changePassword) {
      return {
        status: true,
        message: "Password changed",
      };
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
