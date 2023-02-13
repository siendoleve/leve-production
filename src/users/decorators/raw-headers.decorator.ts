import { createParamDecorator } from '@nestjs/common/decorators';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { ExecutionContext } from '@nestjs/common/interfaces';

/* Creating a decorator that can be used to get the raw headers from the request. */
export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.rawHeaders;
  },
);
