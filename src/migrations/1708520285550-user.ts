import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1708520285550 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'password', type: 'varchar', isNullable: false },
          {
            name: 'resetToken',
            type: 'varchar',
            default: null,
            isNullable: true,
          },
          {
            name: 'resetTokenExpiration',
            type: 'timestamp',
            isNullable: true,
            default: null,
          },
        ],
      }),
      true,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
  }
}
