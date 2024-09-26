import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Res,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginRegisterDto,
  LoginWebDto,
  ResendVerificationCode,
  TelegramAuthDto,
  VerificationDto,
} from './dto/create-auth.dto';
import { IsPublic } from '@app/shared/decorators/is-public.decorator';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { UpdateProfileAfterVerificationDto } from '@app/accounts/dto/create-account.dto';
import { Scope } from '@app/shared/decorators/scope.decorator';
import { Role } from 'database/migrations/20240409001219_users';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('auth/sign-in')
  login(@Body() payload: LoginWebDto) {
    return this.authService.login(payload);
  }

  @Get('auth/verifications-list')
  @Scope(Role.SUPER_ADMIN)
  verifications() {
    return this.authService.verifications();
  }

  @IsPublic()
  @Post('auth/verification')
  verifyCode(@Body() payload: VerificationDto) {
    return this.authService.verifyMobile(payload);
  }

  @IsPublic()
  @Post('auth/resend-code')
  resetCode(@Body() payload: ResendVerificationCode) {
    return this.authService.resendVerificationCode(payload);
  }

  @IsPublic()
  @Post('mobile/auth/sign-in')
  loginMobile(@Body() payload: LoginRegisterDto) {
    return this.authService.registerMobile(payload);
  }

  @IsPublic()
  @Post('mobile/auth/verification')
  verifyCodeMobile(@Body() payload: VerificationDto) {
    return this.authService.verifyMobile(payload);
  }

  @IsPublic()
  @Put('mobile/auth/after/:id')
  updateAccountProfile(
    @Param() { id }: IdParamDto,
    @Body() data: UpdateProfileAfterVerificationDto,
  ) {
    return this.authService.updateProfileAfterVerification(id, data);
  }

  @IsPublic()
  @Post('mobile/auth/resend-code')
  resetCodeMobile(@Body() payload: ResendVerificationCode) {
    return this.authService.resendVerificationCode(payload);
  }

  @IsPublic()
  @Get('/auth/telegram')
  oauth(@Res() res: Response) {
    res.send(
      `<body style="
      display: flex;
      justify-content: center;
      align-items: center; 
      ">
      <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="iembot" data-size="large"
    data-radius="6" data-auth-url="https://api-qarz.anysoft.uz/v1/auth/callback"></script>
      `,
    );
  }

  @IsPublic()
  @Get('/auth/callback')
  oauthCb(@Query() telegramAuthCallbackDto: any) {
    return telegramAuthCallbackDto;
  }

  @IsPublic()
  @Post('mobile/auth/telegram')
  telegramAuth(@Body() telegramAuthDto: TelegramAuthDto) {
    return this.authService.telegramAuthConfirm(telegramAuthDto);
  }
}
