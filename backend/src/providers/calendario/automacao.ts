import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class Automacao {
  private readonly logger = new Logger(Automacao.name);

  @Cron('0 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
    console.log("ola testando ")
  }
}