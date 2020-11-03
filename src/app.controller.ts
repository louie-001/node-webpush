import { Body, Controller, Ip, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * web 端 service work 就绪时保存 endpoint
   * @param endpoint
   * @param ip
   */
  @Post('endpoint')
  saveEndpoint(@Body() endpoint, @Ip() ip: string): string {
    this.appService.saveEndpoint(endpoint, ip);
    return 'endpoint save success';
  }

  /**
   * 向web端发送消息
   * @param message
   * @param ip
   */
  @Post('message')
  async pushMessage(@Body() message: string, @Query('ip') ip: string): Promise<string> {
    return this.appService.pushMessage(message, ip);
  }
}
