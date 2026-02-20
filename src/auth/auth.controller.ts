import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    //return this.authService.registerUser(data.email, data.password);
    return registerUserDto;
  }

  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    //return this.authService.loginUser(data.email, data.password);
    return loginUserDto;
  }

  @MessagePattern('auth.verify.user')
  verifyToken() {
    //return this.authService.verifyUser(data.token);
    return "Verify token";
  }
}
