import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  registerUser() {
    //return this.authService.registerUser(data.email, data.password);
    return "Register user";
  }

  @MessagePattern('auth.login.user')
  loginUser() {
    //return this.authService.loginUser(data.email, data.password);
    return "Login user";
  }

  @MessagePattern('auth.verify.user')
  verifyToken() {
    //return this.authService.verifyUser(data.token);
    return "Verify token";
  }
}
