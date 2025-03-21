import { PrismaService } from '@/src/core/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { hash } from 'argon2';

@Injectable()
export class AccountService {
    public constructor(private readonly prismaService: PrismaService) {}

    public async findAll() {
        const users = await this.prismaService.user.findMany();
        
        return users;
    }

    public async create(input: CreateUserInput){
        const {username, email, password} = input

        const isUserNameExists = await this.prismaService.user.findUnique({
            where: {
                username
            }
        })

        if(isUserNameExists) {
            throw new ConflictException('Username already exists')
        }
        
        const isUserEmailExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if(isUserEmailExists) {
            throw new ConflictException('Email already exists')
        }

       await this.prismaService.user.create({
            data: {
                username,
                email,
                password: await hash(password),
                displayName: username
            }
        })

        return true
    }
}
