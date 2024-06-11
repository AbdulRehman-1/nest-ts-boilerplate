import { Test, TestingModule } from '@nestjs/testing';
import UserController from './users.controller';
import UserService from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    createUser: jest.fn((dto) => ({ id: 1, ...dto })),
    findAllUser: jest.fn((searchStr, page, pageSize, user) => [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
      },
    ]),
    findOne: jest.fn((id) => ({
      id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    })),
    updateUser: jest.fn((id, dto) => ({ id, ...dto })),
    removeUser: jest.fn((id) => ({ id })),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
        email: 'john@example.com',
      };
      expect(await controller.create(createUserDto)).toEqual({
        id: expect.any(Number),
        ...createUserDto,
      });
      expect(service.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const req = { user: { id: 1 } };
      const result = await controller.findAll(req, 'Doe', 1, 10);
      expect(result).toEqual([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        },
      ]);
      expect(service.findAllUser).toHaveBeenCalledWith(
        'Doe',
        1,
        10,
        req.user,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'johnsmith@example.com',
        password: 'newpassword123',
      };
      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual({ id: 1, ...updateUserDto });
      expect(service.updateUser).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ id: 1 });
      expect(service.removeUser).toHaveBeenCalledWith(1);
    });
  });
});
