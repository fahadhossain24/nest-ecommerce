import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connected successfully!');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected!');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("Can't clean database in production!");
    }

    const modelKeys = Object.keys(this).filter(
      (key) => typeof this[key]?.deleteMany === 'function',
    );

    return Promise.all(modelKeys.map((key) => this[key].deleteMany()));
  }
}
