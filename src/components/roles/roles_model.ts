import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("roles")
class Roles {
  @PrimaryGeneratedColumn("uuid")
  role_id: string;

  @Column({ length: 100, nullable: false, unique: true })
  name: string;

  @Column({ length: 250 })
  description: string;

  @Column({ type: "text" })
  permissions: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Roles;