import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

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

    async verifyToken(token: string) {
      try {
        //extraemos el sub, iat y exp del token para no devolverlos al cliente, el resto de los datos del usuario los devolvemos. Esto seria el payload del token
        const {sub, iat, exp, ...user} = this.jwtService.verify(token, {
          secret: envs.jwtSecret, //esto es necesario para verificar que el token fue firmado con la misma clave secreta que usamos para firmarlo en el método signJWT
        });

        return {
          user: user,
          token: await this.signJWT(user) //esto es necesario para renovar el token cada vez que el usuario lo verifique, así evitamos que el token caduque y el usuario tenga que iniciar sesión nuevamente cada cierto tiempo. El nuevo token tendrá una nueva fecha de expiración.
         };
      }
      catch(error) {
        console.log(error);
        throw new RpcException({
          status: 401,
          message: 'Token not valid',
        })
      }
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
