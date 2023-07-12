import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

/**
 * Представляет категорию для публикации
 */
@Entity()
export default class Category {
  @PrimaryGeneratedColumn()
  public category_id: number;

  @Column()
  public name: string;

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;
}
