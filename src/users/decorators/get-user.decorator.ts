import { createParamDecorator } from '@nestjs/common/decorators';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { ExecutionContext } from '@nestjs/common/interfaces';

/* Creating a decorator that can be used to get the user from the request. */
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return !data ? user : user[data];
  },
);
