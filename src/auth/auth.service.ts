import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger("AuthService");
  
    onModuleInit() {
      this.$connect();
      this.logger.log('MongoDB Connected to the database');
    }

    async registerUser(registerUserDto: RegisterUserDto) {
      const { email, name, password } = registerUserDto;
    
      try {
        const user = await this.user.findUnique({
          where: { email: email },
        });

        if(user){
          throw new RpcException({
            status: 400,
            message: 'User already exists',
          })
        }

        const newUser = await this.user.create({
          data: {
            email,
            password : bcrypt.hashSync(password, 10),
            name,
          },
        });

        //devolvemos todos los datos del usuario excepto la contraseña
        const {password: hashedPassword, ...rest} = newUser;

        return {
          user: rest,
          token: 'ABC'
        };
      } catch (error) {
        throw new RpcException({
          status: 400,
          message: error.message,
        })
      }
    }

    async loginUser(loginUserDto: LoginUserDto) {
      const { email, password } = loginUserDto;
    
      try {
        const user = await this.user.findUnique({
          where: { email },
        });

        if(!user){
          throw new RpcException({
            status: 400,
            message: 'User/Password not valid',
          })
        }

        //comparamos la contraseña ingresada con el hash de la contraseña almacenada en la base de datos
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if(!isPasswordValid){
          throw new RpcException({
            status: 400,
            message: 'Password/User not valid',
          })
        }

        //devolvemos todos los datos del usuario excepto la contraseña
        const {password: hashedPassword, ...rest} = user;

        return {
          user: rest,
          token: 'ABC'
        };
      } catch (error) {
        throw new RpcException({
          status: 400,
          message: error.message,
        })
      }
    }
}
