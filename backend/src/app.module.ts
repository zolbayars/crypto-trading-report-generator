import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [ReportsModule, ConfigModule.forRoot()],
})
export class AppModule {}
