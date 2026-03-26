import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QPointAccount } from './entities/qpoint-account.entity';
import { QPointTransaction } from './entities/qpoint-transaction.entity';
import { BoosterPointsAccount } from './entities/booster-points-account.entity';
import { FraudLog } from './entities/fraud-log.entity';
import { BehaviorLog } from './entities/behavior-log.entity';
import { GeneralLedger } from './entities/general-ledger.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { QPointsTransactionService } from './qpoints-transaction.service';
import { QPointsTransactionController } from './qpoints-transaction.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QPointAccount,
      QPointTransaction,
      BoosterPointsAccount,
      FraudLog,
      BehaviorLog,
      GeneralLedger,
      JournalEntry,
    ]),
    AIModule,
  ],
  controllers: [QPointsTransactionController],
  providers: [QPointsTransactionService],
  exports: [TypeOrmModule, QPointsTransactionService],
})
export class QPointsModule {}
