import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { EntitiesService } from './entities.service';
import { CreateIndividualEntityDto } from './dto/create-individual-entity.dto';
import { CreateOtherEntityDto } from './dto/create-other-entity.dto';
import { CreateBranchDto } from './dto/create-branch.dto';

@ApiTags('entities')
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post('individual')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create individual entity (auto-triggered after user MFA)' })
  @ApiResponse({
    status: 201,
    description: 'Individual entity and Q-Points account created successfully',
    schema: {
      example: {
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        qpointAccountId: '123e4567-e89b-12d3-a456-426614174001',
        message: 'Individual entity and Q-Points account created successfully.',
      },
    },
  })
  @ApiConflictResponse({ description: 'Entity already exists for this user' })
  @ApiBadRequestResponse({ description: 'User not fully verified' })
  async createIndividualEntity(@Body() dto: CreateIndividualEntityDto) {
    return this.entitiesService.createIndividualEntity(dto);
  }

  @Post('other')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create other entity (business/organization)' })
  @ApiResponse({
    status: 201,
    description: 'Other entity and Q-Points account created successfully',
    schema: {
      example: {
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        qpointAccountId: '123e4567-e89b-12d3-a456-426614174001',
        message: 'Other entity and Q-Points account created successfully.',
      },
    },
  })
  @ApiConflictResponse({ description: 'Wire ID or phone number already in use' })
  @ApiNotFoundResponse({ description: 'Creator user not found' })
  async createOtherEntity(@Body() dto: CreateOtherEntityDto) {
    return this.entitiesService.createOtherEntity(dto);
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create branch for an entity' })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully',
    schema: {
      example: {
        branchId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Branch created successfully.',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  async createBranch(@Body() dto: CreateBranchDto) {
    return this.entitiesService.createBranch(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  async findOne(@Param('id') id: string) {
    return this.entitiesService.findById(id);
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get entity by owner ID' })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiNotFoundResponse({ description: 'Entity not found' })
  async findByOwner(@Param('ownerId') ownerId: string) {
    return this.entitiesService.findByOwnerId(ownerId);
  }

  @Get(':entityId/branches')
  @ApiOperation({ summary: 'Get all branches for an entity' })
  @ApiResponse({ status: 200, description: 'Branches found' })
  async findBranches(@Param('entityId') entityId: string) {
    return this.entitiesService.findBranchesByEntityId(entityId);
  }
}
