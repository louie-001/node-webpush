import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webPush = require('web-push');

@Injectable()
export class AppService {
  /**
   * web端service worker 信息
   * demo，简单处理，实际应使用DB等其他方式存储
   */
  private endpointMap: Map<string, string> = new Map();

  private logger: Logger = new Logger(AppService.name);

  /**
   * wep-push, 生成VAPID
   */
  vapidKey(): string {
    return webPush.generateVAPIDKeys();
  }

  /**
   * 存储endpoint
   * @param endpoint
   * @param ip
   */
  saveEndpoint(endpoint: string, ip: string): void {
    this.endpointMap.set(ip, endpoint);
  }

  /**
   * 使用 web-push 发送消息
   * @param message
   * @param ip
   */
  pushMessage(message: string, ip: string): Promise<string> {
    // vapidKey 方法生成，需与web端一致
    const vapidKey = {
      publicKey:
        'BO_sjITRaeBOaC5UDMb6L3_h64FMRozOAgct02jsKcfjvM6SuKcJjQTMXBBGM5H3xhT1u-Oz11_Gi1yC8RDsin4',
      privateKey: '6zkwDjpO7FiilA9lIjGzt7EMV9C9IRMRWH1hWP4J6oc',
    };

    webPush.setVapidDetails(
      'mailto:test@163.com',
      vapidKey.publicKey,
      vapidKey.privateKey,
    );

    return new Promise((resolve, reject) => {
      // send notification
      webPush
        .sendNotification(message, this.endpointMap.get(ip))
        .then(res => {
          this.logger.log(res);
          resolve(res);
        })
        .catch(error => {
          this.logger.error(error);
          reject(error);
        });
    });
  }
}
