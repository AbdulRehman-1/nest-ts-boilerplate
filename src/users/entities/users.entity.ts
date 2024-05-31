import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import * as bcrypt from "bcrypt";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  firstName: string;

  @Column({ type: "varchar", length: 255 })
  lastName: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "varchar", default: null })
  resetToken: string;

  @Column({ type: "timestamp", default: null })
  resetTokenExpiration: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
