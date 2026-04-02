import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { PrismaService } from '@/common/prisma/prisma.service';

@Module({
  controllers: [InvitesController],
  providers: [InvitesService, PrismaService],
  exports: [InvitesService],
})
export class InvitesModule {}
