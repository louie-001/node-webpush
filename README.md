# Push API

> The Push API gives web applications the ability to receive messages pushed to them from a server, whether or not the web app is in the foreground, or even currently loaded, on a user agent. This lets developers deliver asynchronous notifications and updates to users that opt in, resulting in better engagement with timely new content.

web应用接收来自server的消息，以往都是通过长连接或者轮训的方式获取。W3C Push API为Web应用接收来自server的消息提供了一种能力，不论Web程序是否在前台，我们都可以异步的向Web应用下发消息，就像原生APP那样。本文主要介绍NodeJS服务端使用web-push向web端发送消息，关于Push API的详细说明可查阅 [MDN web dosc](https://developer.mozilla.org/zh-CN/docs/Web/API/Push_API)。

# web-push
使用web push功能推送消息到用户浏览器是比较复杂的，不仅需要以 web push协议向push service发送POST请求，而且header中需要VAPID信息以及对消息的加密信息。**web-push** 是一个实现web push消息推送的Node 库。

# web push 服务
## 创建工程，安装依赖
新建node-webpush工程，使用NestJS框架：
```
nest new node-webpush
```
```
目录结构：
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json

```

安装web-push库：
```
npm i web-push -S
```

## app.controller.ts

```javascript
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
```

## app.service.ts

```javascript
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
```

> 1. 下篇博文将介绍web如何注册 service worker 并提交endpoint；
> 2. demo 源码https://github.com/louie-001/node-webpush.git；
