import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Not, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import User from './entities/users.entity';
import * as bcrypt from 'bcrypt';
import { Exception } from 'handlebars';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    const { firstName, lastName, email, password } = createUserDto;

    const alreadyUser = await this.findByEmail(email);
    if (alreadyUser) {
      throw new ConflictException('User already exist');
    }

    const user: User = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const payload = { sub: user.id, username: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    user.password = hashedPassword;
    const response = await this.userRepository.save(user);
    if (!response) throw new Exception('User not created');

    delete user['password'];

    return { user, message: 'User Created', access_token: accessToken };
  }

  async findAllUser(
    searchStr: string = null,
    page = 1,
    pageSize = 10,
  ): Promise<{
    users: User[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const query = queryBuilder.select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
    ]);

    if (searchStr) {
      query.where((qb) => {
        qb.orWhere('LOWER(user.firstName) LIKE LOWER(:search)', {
          search: `%${searchStr}%`,
        })
          .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', {
            search: `%${searchStr}%`,
          })
          .orWhere('LOWER(user.email) LIKE LOWER(:search)', {
            search: `%${searchStr}%`,
          });
      });
    }

    const [users, totalCount] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      users,
      totalCount,
      currentPage: page,
      totalPages,
    };
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'firstName', 'lastName', 'email'],
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { firstName, lastName, email, password } = updateUserDto;
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    let accessToken = null;
    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email, id: Not(id) },
      });
      if (existingUser) {
        throw new ConflictException('User already exists');
      }
      const payload = { sub: user.id, username: email };
      accessToken = await this.jwtService.signAsync(payload);
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    if (password !== undefined) {
      if (password.length === 0) {
        throw new ForbiddenException("Password can't be empty");
      }
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'User updated',
      user: {
        ...updatedUser,
        ...(accessToken && { accessToken }),
      },
    };
  }

  async resetPasswordRequest(token: string, user: User) {
    user.resetToken = token;
    const expiryDate = new Date();
    const date = new Date(expiryDate.getTime() + 360000);
    user.resetTokenExpiration = date;
    return this.userRepository.save(user);
  }

  async resetPassword(token: string, password: string) {
    const user = await this.findByToken(token);
    if (!user)
      throw new UnauthorizedException('Password reset token is invalid!');
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    return this.userRepository.save(user);
  }

  async removeUser(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deleteduser = await this.userRepository.delete(id);
    if (deleteduser) {
      return {
        message: 'User deleted',
      };
    }
  }

  async findByEmail(identifier: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email: identifier },
    });
  }

  async findByToken(token: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: MoreThan(new Date()),
      },
    });
  }
}
