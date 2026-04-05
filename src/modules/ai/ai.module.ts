import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIModel } from './entities/ai-model.entity';
import { AIInference } from './entities/ai-inference.entity';
import { AIFeature } from './entities/ai-feature.entity';
import { AIRecommendation } from './entities/ai-recommendation.entity';
import { AIWorkflow } from './entities/ai-workflow.entity';
import { AIEvent } from './entities/ai-event.entity';
import { AINlpService } from './services/ai-nlp.service';
import { AIPricingService } from './services/ai-pricing.service';
import { AIFraudService } from './services/ai-fraud.service';
import { AIInsightsService } from './services/ai-insights.service';
import { AISearchService } from './services/ai-search.service';
import { AIRecommendationsService } from './services/ai-recommendations.service';
import { AITensorflowService } from './services/ai-tensorflow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AIModel,
      AIInference,
      AIFeature,
      AIRecommendation,
      AIWorkflow,
      AIEvent,
    ]),
    HttpModule,
  ],
  controllers: [AIController],
  providers: [AIService, AINlpService, AIPricingService, AIFraudService, AIInsightsService, AISearchService, AIRecommendationsService, AITensorflowService],
  exports:   [AIService, AINlpService, AIPricingService, AIFraudService, AIInsightsService, AISearchService, AIRecommendationsService, AITensorflowService],
})
export class AIModule {}
