import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { User } from '@app/shared/decorators/user.decorator';
import { BannedUsersService } from './services/banned_users.service';
import { GetMeBannedListDto } from './dto/get-me-banned-list.dto';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { GetMeUserContactsDto } from './dto/get-me-user-contacts.dto';
import { CreateMultipleContactDto } from './dto/create-multiple-contact.dto';
import {
  CreateEmployeeDto,
  UpdateProfileAfterVerificationDto,
} from './dto/create-account.dto';
import {
  UpdateAccountSettingsDto,
  UpdateAccountSettingsParamDto,
} from './dto/update-settings.dto';
import { Activity } from '@app/shared/decorators/activity.decorator';
import {
  ActivityActionType,
  ActivityType,
} from 'database/migrations/20240417060633_activities';
import { activityMessages } from '@app/shared/constants/activity-messages';
import { GetCustomersListDto } from './dto/get-customers-list.dto';
import { Scope } from '@app/shared/decorators/scope.decorator';
import { Role } from 'database/migrations/20240409001219_users';
import { GetEmployeesListDto } from './dto/get-employees-list.dto';
import { EmployeeBannedOrUnbanned } from './dto/employee-banned-or-unbanned.dto';
import { GetPopularCustomersDto } from './dto/get-popular-customers.dto';
import { IdParamDto } from '@app/shared/dto/id-param.dto';
import { UpdatePhoneDto, VerifyPhoneDto } from './dto/update-phone.dto';

@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountsService,
    private readonly bannedUsersService: BannedUsersService,
  ) {}

  @Post('accounts')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    action_type: ActivityActionType.CREATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.create,
  })
  createAccount(@Body() data: CreateEmployeeDto) {
    return this.accountService.createEmployee(
      data as Required<CreateEmployeeDto>,
    );
  }

  @Get('mobile/accounts/me')
  findProfile(@User('id') user_id: number) {
    return this.accountService.getProfile(user_id);
  }

  @Get('/customers')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.USER,
    description: activityMessages.user.readCustomerList,
  })
  getCustomerList(@Query() getCustomersListDto: GetCustomersListDto) {
    return this.accountService.getCustomerList(getCustomersListDto);
  }

  @Get('/employees')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.USER,
    description: activityMessages.user.readEmployeeList,
  })
  getEmployeeList(@Query() getEmployeeListDto: GetEmployeesListDto) {
    return this.accountService.getEmployeeList(getEmployeeListDto);
  }

  @Get('/employees/:id')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.USER,
    description: activityMessages.user.readOneEmployee,
  })
  getEmployee(@Param() { id }: IdParamDto) {
    return this.accountService.getOneEmployee(id);
  }

  @Delete('/employees/:id')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    action_type: ActivityActionType.DELETE,
    item_type: ActivityType.USER,
    description: activityMessages.user.deleteEmployee,
  })
  deleteEmployee(@Param() { id }: IdParamDto) {
    return this.accountService.deleteEmployee(id);
  }

  @Patch('/employees/:id')
  @Scope(Role.SUPER_ADMIN)
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.bannedEmployee,
  })
  employeeBannedOrUnbanned(
    @User('id') userId: number,
    @Param() { id }: IdParamDto,
    @Body() employeeBannOrUnbann: EmployeeBannedOrUnbanned,
  ) {
    return this.accountService.employeeBannedOrUnbanned(
      userId,
      id,
      employeeBannOrUnbann,
    );
  }

  @Get('/mobile/customers/popular')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.USER,
    description: activityMessages.user.readPopularCustomers,
  })
  getPopularCustomers(@Query() getPopularCustomersDto: GetPopularCustomersDto) {
    return this.accountService.getPopularCustomers(getPopularCustomersDto);
  }

  @Get('mobile/accounts/me/banneds')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.BANNED_USER,
    description: activityMessages.banned_users.readList,
  })
  getMeBannedList(
    @User('id') userId: number,
    @Query() getMebannedListDto: GetMeBannedListDto,
  ) {
    return this.bannedUsersService.getBannedUserListByAuthor(
      userId,
      getMebannedListDto,
    );
  }

  @Get('/mobile/accounts/contacts')
  @Activity({
    action_type: ActivityActionType.READ,
    item_type: ActivityType.USER_CONTACT,
    description: activityMessages.user_contacts.readList,
  })
  getUserContacts(
    @User('id') userId: number,
    @Query() getUserContactsListDto: GetMeUserContactsDto,
  ) {
    return this.accountService.getMeContactList(userId, getUserContactsListDto);
  }

  @Post('/mobile/accounts/contacts')
  @Activity({
    action_type: ActivityActionType.CREATE,
    item_type: ActivityType.USER_CONTACT,
    description: activityMessages.user_contacts.create,
  })
  createUserContact(
    @User('id') userId: number,
    @Body() createUserContactDto: CreateUserContactDto,
  ) {
    return this.accountService.createContact(
      userId,
      createUserContactDto as Required<CreateUserContactDto>,
    );
  }

  @Post('/mobile/accounts/contacts/synchronization')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER_CONTACT,
    description: activityMessages.user_contacts.sync,
  })
  createUserMultipleContact(
    @User('id') userId: number,
    @Body() createMultipleContactDto: CreateMultipleContactDto,
  ) {
    return this.accountService.createMultipleContact(
      userId,
      createMultipleContactDto as Required<CreateMultipleContactDto[0]>[],
    );
  }

  @Put('/mobile/accounts/me')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.profileUpdate,
  })
  updateProfile(
    @User('id') userId: number,
    @Body() updateProfileDto: Partial<UpdateProfileAfterVerificationDto>,
  ) {
    return this.accountService.updateProfile(userId, updateProfileDto);
  }

  @Put('mobile/accounts/phone')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.phoneUpdate,
  })
  updatePhoneMobile(@User('id') userId: number, @Body() dto: UpdatePhoneDto) {
    return this.accountService.updatePhone(userId, dto);
  }

  @Put('accounts/phone')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.phoneUpdate,
  })
  updatePhoneWeb(@User('id') userId: number, @Body() dto: UpdatePhoneDto) {
    return this.accountService.updatePhone(userId, dto);
  }

  @Put('mobile/accounts/phone/verification')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.phoneUpdate,
  })
  updatePhoneVerification(
    @User('id') userId: number,
    @Body() dto: VerifyPhoneDto,
  ) {
    return this.accountService.verifyPhone(userId, dto);
  }

  @Put('accounts/phone/verification')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.phoneUpdate,
  })
  updatePhoneVerificationWeb(
    @User('id') userId: number,
    @Body() dto: VerifyPhoneDto,
  ) {
    return this.accountService.verifyPhone(userId, dto);
  }

  @Scope(Role.SUPER_ADMIN)
  @Put('/employees/:id')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.updateEmployee,
  })
  updateEmployee(
    @Param() { id }: IdParamDto,
    @Body() updateProfileDto: Partial<CreateEmployeeDto>,
  ) {
    return this.accountService.updateEmployee(id, updateProfileDto);
  }

  @Put('/mobile/accounts/settings/:type')
  @Activity({
    action_type: ActivityActionType.UPDATE,
    item_type: ActivityType.USER,
    description: activityMessages.user.settingsUpdate,
  })
  updateAccountSettings(
    @User('id') userId: number,
    @Param() type: UpdateAccountSettingsParamDto,
    @Body() data: UpdateAccountSettingsDto,
  ) {
    return this.accountService.updateAccountSetting(userId, type, data);
  }
}
