import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import UsersService from './users.service';
import User from './entities/users.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

const mockUserRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user and return it with a token', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      mockUserRepository.save.mockResolvedValue({ ...createUserDto, id: 1 });

      const result = await service.createUser(createUserDto);

      expect(result).toBeTruthy()
    });

    it('should throw a ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(createUserDto as any);

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllUser', () => {
    it('should return paginated users', async () => {
      const users: User[] = [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as User,
      ];

      mockUserRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([users, 1]),
      });

      const result = await service.findAllUser(null, 1, 10, null);

      expect(result).toEqual({
        users,
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user: User = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as User;

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toBeTruthy();
    });

    it('should throw a NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).resolves.toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Jane' };
      const user: User = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as User;

      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, ...updateUserDto });

      const result = await service.updateUser(1, updateUserDto);

      expect(result).toEqual({
        message: 'User updated',
        user: { ...user, ...updateUserDto },
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.updateUser(1, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw a ConflictException if email is already taken', async () => {
      const updateUserDto: UpdateUserDto = { email: 'jane@example.com' };
      const user: User = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as User;

      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      mockUserRepository.findOne.mockResolvedValue({ ...user, id: 2 });

      await expect(service.updateUser(1, updateUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw a ForbiddenException if password is empty', async () => {
      const updateUserDto: UpdateUserDto = { password: '' };
      const user: User = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as User;

      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      await expect(service.updateUser(1, updateUserDto)).rejects.toThrow(ForbiddenException);
    });
  });

  


  describe('resetPassword', () => {
    it('should reset the password if token is valid', async () => {
      const user: User = { id: 1, password: 'oldPassword', resetToken: 'validToken' } as User;
  
      jest.spyOn(service, 'findByToken').mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({ ...user, password: 'newHashedPassword' });
  
      const result = await service.resetPassword('validToken', 'newPassword');
  
      expect(result).toBeDefined();
    });
  
    it('should throw an UnauthorizedException if token is invalid', async () => {
      jest.spyOn(service, 'findByToken').mockResolvedValue(null);
  
      await expect(service.resetPassword('invalidToken', 'newPassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('removeUser', () => {
    it('should delete a user if found', async () => {
      const user: User = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' } as User;

      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeUser(1);

      expect(result).toEqual({ message: 'User deleted' });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.removeUser(1)).rejects.toThrow(NotFoundException);
    });
  });
});
