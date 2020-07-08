import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column("text", { unique: true })
    username: string;

    @Field()
    @Column("text", { unique: true })
    email: string;

    @Column()
    password: string;

    @Column("bool", { default: false })
    confirmed: boolean;
}