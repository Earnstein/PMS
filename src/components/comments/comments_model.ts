import  Tasks  from "../tasks/tasks_model";
import  Users  from "../users/users_model";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";

@Entity("comments")
class Comments {

  @PrimaryGeneratedColumn("uuid")
  comment_id: string;

  @Column({ type: "text" })
  comment: string;

  @OneToOne(() => Users, (userData) => userData.user_id)
  @JoinColumn({ name: "user_id" })
  user_id: string;

  @OneToOne(() => Tasks, (taskData) => taskData.task_id)
  @JoinColumn({ name: "task_id" })
  task_id: string;

  @Column("text", { array: true, default: [] })
  supported_files: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


export default Comments;