import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import User from "./User.js";
import Category from "./Category.js";

/**
 * Представляет публикацию, созданную пользователем
 */
@Entity()
export default class Post {
  @PrimaryGeneratedColumn()
  public post_id: number;

  @Column()
  public title: string;

  @Column("text")
  public content: string;

  @ManyToOne(() => User)
  public author: User;

  @ManyToMany(() => Category)
  @JoinTable()
  public categories: Category[];

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;
}
