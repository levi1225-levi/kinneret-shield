import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class AttendanceScheduler {
  private logger = new Logger(AttendanceScheduler.name);

  constructor(
    private attendanceService: AttendanceService,
    private devicesService: DevicesService,
  ) {}

  @Cron('0 * * * *')
  async autoCheckoutTask() {
    try {
      this.logger.log('Running auto-checkout task');
      const count = await this.attendanceService.autoCheckout();
      this.logger.log(`Auto-checkout completed: ${count} records`);
    } catch (error) {
      this.logger.error('Auto-checkout task failed:', error);
    }
  }

  @Cron(process.env.DAILY_REPORT_CRON || '0 0 * * *')
  async dailyReportTask() {
    try {
      this.logger.log('Running daily report generation task');
      const reports = await this.attendanceService.generateDailyReports();
      this.logger.log(`Daily reports generated: ${reports.length} reports`);
    } catch (error) {
      this.logger.error('Daily report task failed:', error);
    }
  }

  @Cron('*/5 * * * *')
  async checkDeviceHeartbeatsTask() {
    try {
      this.logger.debug('Checking device heartbeats');
      await this.devicesService.checkOfflineDevices();
    } catch (error) {
      this.logger.error('Device heartbeat check failed:', error);
    }
  }
}
