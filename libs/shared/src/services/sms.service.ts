import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  private token = '';
  private firstSenderId = 0;

  constructor(private readonly configService: ConfigService) {}

  async login() {
    const payload = {
      email: this.configService.get('SMS_EMAIL'),
      password: this.configService.get('SMS_TOKEN'),
    };
    return this.useFetch('LOGIN', payload)
      .then((res) => res.json())
      .then(async (res) => {
        if (res.message === 'token_generated') {
          return res.data.token;
        } else {
          this.logger.log(res);
        }
      })
      .catch((err) => this.logger.error(err));
  }

  refresh() {
    return this.useFetch('REFRESH');
  }

  profile() {
    return this.useFetch('CURRENT_USER');
  }

  async send({
    phone,
    code,
    text,
  }: {
    phone: number;
    code?: number;
    text?: string;
  }) {
    const message = text ? text : `Sizning tasdiqlash kodingiz: ${code}`;
    return this.useFetch('SEND_SMS', {
      mobile_phone: phone,
      message,
      from: 4546,
      callback_url: this.configService.get('SMS_CALLBACK_URL'),
    })
      .then((res) => res.json())
      .then((res) => this.logger.log(res))
      .catch((err) => this.logger.error(err));
  }

  private async useFetch(url: string, payload: any = {}): Promise<any> {
    if (!this.token && this.firstSenderId == 0) {
      this.firstSenderId++;
      await this.login().then((result) => (this.token = result));
    }
    const API_URL = {
      LOGIN: {
        URL: 'https://notify.eskiz.uz/api/auth/login',
        OPTIONS: {
          method: 'POST',
          body: JSON.stringify(payload),
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      },
      REFRESH: {
        URL: 'https://notify.eskiz.uz/api/auth/refresh',
        OPTIONS: {
          method: 'PATCH',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        },
      },
      CURRENT_USER: {
        URL: 'https://notify.eskiz.uz/api/auth/user',
        OPTIONS: {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        },
      },
      SEND_SMS: {
        URL: 'https://notify.eskiz.uz/api/message/sms/send',
        OPTIONS: {
          method: 'POST',
          body: JSON.stringify(payload),
          redirect: 'follow',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        },
      },
    };

    const API = API_URL[url];

    return fetch(API.URL, API.OPTIONS);
  }
}
