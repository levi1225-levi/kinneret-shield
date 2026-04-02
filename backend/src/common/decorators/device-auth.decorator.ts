import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedDevice {
  deviceId: string;
  serialNumber: string;
  roomId: string;
}

export const DeviceAuth = createParamDecorator(
  (data: keyof AuthenticatedDevice | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const device = request.device as AuthenticatedDevice;

    return data ? device?.[data] : device;
  },
);
