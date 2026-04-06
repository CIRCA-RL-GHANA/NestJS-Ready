import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PlannerService } from './planner.service';
import { CreatePlannerTransactionDto, UpdatePlannerTransactionDto } from './dto';
import { PlannerTransaction, TransactionType } from './entities/planner-transaction.entity';

@ApiTags('Planner')
@Controller('planner')
@ApiBearerAuth()
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Post('transactions')
  @ApiOperation({ summary: 'Add a new financial transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: PlannerTransaction,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async addTransaction(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreatePlannerTransactionDto,
  ): Promise<PlannerTransaction> {
    return this.plannerService.addTransaction(userId, createDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions for the user' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [PlannerTransaction],
  })
  async getTransactions(@CurrentUser('id') userId: string): Promise<PlannerTransaction[]> {
    return this.plannerService.getTransactions(userId);
  }

  @Get('transactions/type/:type')
  @ApiOperation({ summary: 'Get transactions by type (income or expense)' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [PlannerTransaction],
  })
  async getTransactionsByType(
    @CurrentUser('id') userId: string,
    @Param('type') type: TransactionType,
  ): Promise<PlannerTransaction[]> {
    return this.plannerService.getTransactionsByType(userId, type);
  }

  @Get('transactions/month')
  @ApiOperation({ summary: 'Get transactions for a specific month' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [PlannerTransaction],
  })
  @ApiQuery({ name: 'month', required: true, example: '01' })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  async getTransactionsByMonth(
    @CurrentUser('id') userId: string,
    @Query('month') month: string,
    @Query('year') year: number,
  ): Promise<PlannerTransaction[]> {
    return this.plannerService.getTransactionsByMonth(userId, month, year);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get overall financial summary' })
  @ApiResponse({ status: 200, description: 'Summary generated successfully' })
  async getSummary(@CurrentUser('id') userId: string) {
    return this.plannerService.getSummary(userId);
  }

  @Get('summary/monthly')
  @ApiOperation({ summary: 'Get monthly financial summary' })
  @ApiResponse({ status: 200, description: 'Monthly summary generated successfully' })
  @ApiQuery({ name: 'month', required: true, example: '01' })
  @ApiQuery({ name: 'year', required: true, example: 2024 })
  async getMonthlySummary(
    @CurrentUser('id') userId: string,
    @Query('month') month: string,
    @Query('year') year: number,
  ) {
    return this.plannerService.getMonthlySummary(userId, month, year);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get a specific transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    type: PlannerTransaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<PlannerTransaction> {
    return this.plannerService.getTransactionById(id, userId);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Partially update a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: PlannerTransaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async patchTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePlannerTransactionDto,
  ): Promise<PlannerTransaction> {
    return this.plannerService.updateTransaction(id, userId, updateDto);
  }

  @Put('transactions/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: PlannerTransaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePlannerTransactionDto,
  ): Promise<PlannerTransaction> {
    return this.plannerService.updateTransaction(id, userId, updateDto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async deleteTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.plannerService.deleteTransaction(id, userId);
    return { message: 'Transaction deleted successfully' };
  }

  // ─── AI-powered financial intelligence ───────────────────────────────────

  @Get('ai/insights')
  @ApiOperation({ summary: 'Get AI-powered financial insights for the authenticated user' })
  @ApiResponse({ status: 200, description: 'AI financial insights generated' })
  async getAIFinancialInsights(@CurrentUser('id') userId: string) {
    return this.plannerService.getAIFinancialInsights(userId);
  }

  @Get('ai/spending-pattern')
  @ApiOperation({ summary: 'Get AI spending pattern analysis' })
  @ApiResponse({ status: 200, description: 'Spending pattern retrieved' })
  async getAISpendingPattern(@CurrentUser('id') userId: string) {
    return this.plannerService.getAISpendingPattern(userId);
  }

  @Get('ai/forecast')
  @ApiOperation({ summary: 'Get AI income forecast for next 7 and 30 days' })
  @ApiResponse({ status: 200, description: 'Revenue forecast retrieved' })
  async getAIRevenueForecast(@CurrentUser('id') userId: string) {
    return this.plannerService.getAIRevenueForecast(userId);
  }
}
