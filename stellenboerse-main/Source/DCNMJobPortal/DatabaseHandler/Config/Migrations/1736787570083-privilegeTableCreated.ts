import { MigrationInterface, QueryRunner } from "typeorm";

export class PrivilegeTableCreated1736787570083 implements MigrationInterface {
    name = 'PrivilegeTableCreated1736787570083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`privilege\` (\`KeyID\` int NOT NULL AUTO_INCREMENT, \`PrivilegeKey\` varchar(24) NOT NULL, PRIMARY KEY (\`KeyID\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`privilege\``);
    }

}
