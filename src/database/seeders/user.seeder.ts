import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import userData from '../seeders/data/user.data.json';
import User from 'src/users/entities/users.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserSeed implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    try {
      for (const data of userData) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password, salt);
        data.password = hashedPassword;
        const data1 = { ...data, password: hashedPassword };
        await this.userRepository.save(data1);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async drop(): Promise<any> {
    try {
      await this.userRepository.query(`DELETE FROM pickup_location`);
    } catch (e) {
      console.error('error seeding db : ', e);
    }
  }
}
