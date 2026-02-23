import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger("AuthService");
  
    constructor(private readonly jwtService: JwtService) {
      super(); //esto es necesario para que el PrismaClient se inicialice correctamente
    }

    onModuleInit() {
      this.$connect();
      this.logger.log('MongoDB Connected to the database');
    }

    //este método se encarga de generar un token JWT a partir de un payload
    //tenemos que invocarlo cada vez que el usuario se registre o inicie sesión correctamente para generar un token válido
    async signJWT(payload: JwtPayload) {
      return this.jwtService.sign(payload);
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
        const {password: hashedPassword, createdAt: cA, updatedAt: uA, ...rest} = newUser;

        return {
          user: rest,
          token: await this.signJWT(rest),
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
        const {password: hashedPassword, createdAt: cA, updatedAt: uA, ...rest} = user;

        return {
          user: rest,
          token: await this.signJWT(rest)
        };
      } catch (error) {
        throw new RpcException({
          status: 400,
          message: error.message,
        })
      }
    }
}
