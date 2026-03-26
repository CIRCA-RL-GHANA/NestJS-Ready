#!/bin/bash
# Complete Backend Module Generator Script
# This script creates all remaining backend modules with standard structure

# Modules list
MODULES=(
  "ai"
  "calendar"
  "entity-profiles"
  "favorite-drivers"
  "health"
  "interests"
  "market-profiles"
  "places"
  "planner"
  "statement"
  "subscriptions"
  "vehicles"
  "wishlist"
)

# Create module directories and files
for module in "${MODULES[@]}"; do
  # Create directories
  mkdir -p "src/modules/$module/controllers"
  mkdir -p "src/modules/$module/services"
  mkdir -p "src/modules/$module/entities"
  mkdir -p "src/modules/$module/dto"
  
  # Create service file
  cat > "src/modules/$module/services/${module#-}.service.ts" << 'EOF'
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ModuleService {
  private readonly logger = new Logger(ModuleService.name);

  constructor() {
    this.logger.log('Service initialized');
  }
}
EOF

  # Create controller file
  cat > "src/modules/$module/controllers/${module#-}.controller.ts" << 'EOF'
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ModuleService } from '../services/${module#-}.service';

@ApiTags('Module')
@Controller('module')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all' })
  findAll() {
    return { data: [], message: 'Not implemented' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get by ID' })
  findOne(@Param('id') id: string) {
    return { data: null, message: 'Not implemented' };
  }

  @Post()
  @ApiOperation({ summary: 'Create' })
  create(@Body() dto: any) {
    return { data: null, message: 'Not implemented' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update' })
  update(@Param('id') id: string, @Body() dto: any) {
    return { data: null, message: 'Not implemented' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete' })
  delete(@Param('id') id: string) {
    return { success: true, message: 'Not implemented' };
  }
}
EOF

  # Create module file
  cat > "src/modules/$module/${module#-}.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { ModuleService } from './services/${module#-}.service';
import { ModuleController } from './controllers/${module#-}.controller';

@Module({
  providers: [ModuleService],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ${module^}Module {}
EOF

done

echo "✅ All modules generated successfully!"
