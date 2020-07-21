import {Entity, Column, BaseEntity, PrimaryGeneratedColumn} from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { BUCKET_URL } from '../secrets';

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

    @Field()
    @Column("text", { default: `${BUCKET_URL}/profile/Default.png`})
    imageURL: string;

    @Column({nullable: true})
    password: string;

    @Column("bool", { default: false })
    confirmed: boolean;
}