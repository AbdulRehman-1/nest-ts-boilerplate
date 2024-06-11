## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

### Features Implemented

- **Authentication Guards**: Implemented `JwtAuthGuard` and `LocalAuthGuard` to secure routes based on JWT and Local strategy.
- **Migrations and Seeders**: Included database migrations and seeders for easy database setup and population.
- **Husky**: Integrated Husky to enforce pre-commit and pre-push hooks for linting and formatting checks.
- **ESLint and Prettier Formatter**: Configured ESLint with TypeScript support and Prettier as a code formatter to ensure code consistency and maintainability.

Feel free to explore and customize the project to suit your specific requirements.

# NestJS BoilerPlate with JWT and Local Strategy

This project demonstrates how to implement authentication in a NestJS application using JWT (JSON Web Token) and Local strategy. The repository includes two auth guards: `JwtAuthGuard` and `LocalAuthGuard`.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (>= 12.x)
- npm (>= 6.x)
- NestJS CLI (optional, but recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/abdulrehman-11/nest-ts-boilerplate.git
   cd nest-ts-boilerplate
   ```

2. Install the dependencies:

   ```bash
   npm install
   yarn
   ```

3. Set up your environment variables. Create a `.env` file in the root directory and add the following variables:

   ```plaintext
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION_TIME=3600s
   ```

<!-- ## Installation

```bash
$ yarn install
``` -->

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# unit tests single file
$ "yarn run test <filename.ts>"

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov

```

## Migration

```bash
# run all migerations
$ npm run migration:run
```

## Usage

In migrations folder 1708520285550-user.ts

```bash
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1708520285550 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
```

```bash
# create a new migration
$ "npm run migration:create --name=user"

# revert migration
$ npm run migration:revert

#drop migration
$ npm run migration:drop
```

## Seed

```bash
# run all the seeders
$ yarn run seed

```

## JwtStrategy

Authenticate the user with jwt strategy

## Usage

```bash
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import UsersService from '../../users/users.service';
import { JwtPayload } from '../jwt-payload.interface';
import { JwtRefreshTokenStrategy } from './jwt-refresh-token.strategy';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
    this.logger.warn('JwtStrategy initialized');
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findByEmail(payload.username);
    if (user) return user;
    if (!user) {
      throw new UnauthorizedException('User not exist');
    }
  }
}

```

## Jwt AuthGuard

Jwt AuthGuard implements the Jwt Strategy.

```bash
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('searchStr') searchStr: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.userService.findAllUser(searchStr, page, pageSize);
  }
}

```

## Local AuthGuard

This AuthGuard implements the Local Strategy for authenticating users from the database.

```bash
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('searchStr') searchStr: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.userService.findAllUser(searchStr, page, pageSize);
  }
}

```
