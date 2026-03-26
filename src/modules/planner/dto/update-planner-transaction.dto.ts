import { PartialType } from '@nestjs/swagger';
import { CreatePlannerTransactionDto } from './create-planner-transaction.dto';

export class UpdatePlannerTransactionDto extends PartialType(CreatePlannerTransactionDto) {}
