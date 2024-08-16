import  Roles  from '../roles/roles_model';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
  } from "typeorm";

  @Entity("users")
  class Users {
    @PrimaryGeneratedColumn("uuid")
    user_id: string;
  
    @Column({ length: 250, nullable: true })
    firstname: string;

    @Column({ length: 250, nullable: true })
    lastname: string;

    @Column({ length: 250, nullable: false, unique: true })
    username: string;
    
    @Column({ length: 100, nullable: false, unique: true })
    email: string;
  
    @Column({ length: 100, nullable: false })
    password: string;
  
    @Column({ nullable: false })
    @ManyToOne(() => Roles)
    @JoinColumn({name: 'role_id'})
    role_id: Roles['role_id'];
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
}


export default Users;