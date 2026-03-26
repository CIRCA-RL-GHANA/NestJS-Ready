import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleBandDto } from './dto/create-vehicle-band.dto';
import { UpdateVehicleBandDto } from './dto/update-vehicle-band.dto';
import { AddVehicleToBandDto } from './dto/add-vehicle-to-band.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehicleAssignmentDto } from './dto/create-vehicle-assignment.dto';
import { UpdateVehicleAssignmentDto } from './dto/update-vehicle-assignment.dto';
import { CreateVehicleMediaDto } from './dto/create-vehicle-media.dto';
import { CreateVehiclePricingDto } from './dto/create-vehicle-pricing.dto';
import { UpdateVehiclePricingDto } from './dto/update-vehicle-pricing.dto';
import { VehicleStatus } from './entities/vehicle.entity';
import { AssignmentStatus } from './entities/vehicle-assignment.entity';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // Vehicle Band Endpoints
  @Post('bands')
  @ApiOperation({ summary: 'Create a vehicle band (manager can only create ONE)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Band created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Manager already has a band' })
  createBand(
    @Body() createBandDto: CreateVehicleBandDto,
    @Query('managerId') managerId: string,
  ) {
    return this.vehiclesService.createBand(managerId, createBandDto);
  }

  @Get('bands')
  @ApiOperation({ summary: 'Get all vehicle bands with optional filters' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'managerId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  getBands(
    @Query('branchId') branchId?: string,
    @Query('managerId') managerId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.vehiclesService.getBands(
      branchId,
      managerId,
      isActive ? isActive === 'true' : undefined,
    );
  }

  @Get('bands/:id')
  @ApiOperation({ summary: 'Get band by ID' })
  getBandById(@Param('id') id: string) {
    return this.vehiclesService.getBandById(id);
  }

  @Put('bands/:id')
  @ApiOperation({ summary: 'Update a vehicle band' })
  updateBand(
    @Param('id') id: string,
    @Body() updateBandDto: UpdateVehicleBandDto,
    @Query('managerId') managerId: string,
  ) {
    return this.vehiclesService.updateBand(id, managerId, updateBandDto);
  }

  @Delete('bands/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle band' })
  deleteBand(@Param('id') id: string, @Query('managerId') managerId: string) {
    return this.vehiclesService.deleteBand(id, managerId);
  }

  // Band Membership Endpoints
  @Post('bands/memberships')
  @ApiOperation({ summary: 'Add vehicle to a band' })
  addVehicleToBand(@Body() dto: AddVehicleToBandDto) {
    return this.vehiclesService.addVehicleToBand(dto);
  }

  @Delete('bands/memberships/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove band membership by ID' })
  removeMembershipById(@Param('id') id: string) {
    return this.vehiclesService.removeMembershipById(id);
  }

  @Delete('bands/:bandId/vehicles/:vehicleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove vehicle from a band' })
  removeVehicleFromBand(
    @Param('bandId') bandId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.vehiclesService.removeVehicleFromBand(vehicleId, bandId);
  }

  @Get('bands/:bandId/vehicles')
  @ApiOperation({ summary: 'Get all vehicles in a band' })
  getVehiclesInBand(@Param('bandId') bandId: string) {
    return this.vehiclesService.getVehiclesInBand(bandId);
  }

  @Get(':vehicleId/bands')
  @ApiOperation({ summary: 'Get all bands for a vehicle' })
  getBandsForVehicle(@Param('vehicleId') vehicleId: string) {
    return this.vehiclesService.getBandsForVehicle(vehicleId);
  }

  // Vehicle Endpoints
  @Post()
  @ApiOperation({ summary: 'Register a new vehicle' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Vehicle created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Plate number already exists' })
  createVehicle(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.createVehicle(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles with optional filters' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: VehicleStatus })
  @ApiQuery({ name: 'type', required: false })
  getVehicles(
    @Query('branchId') branchId?: string,
    @Query('status') status?: VehicleStatus,
    @Query('type') type?: string,
  ) {
    return this.vehiclesService.getVehicles(branchId, status, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  getVehicleById(@Param('id') id: string) {
    return this.vehiclesService.getVehicleById(id);
  }

  @Get('plate/:plateNumber')
  @ApiOperation({ summary: 'Get vehicle by plate number' })
  getVehicleByPlateNumber(@Param('plateNumber') plateNumber: string) {
    return this.vehiclesService.getVehicleByPlateNumber(plateNumber);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  updateVehicle(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.updateVehicle(id, updateVehicleDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a vehicle' })
  patchVehicle(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.updateVehicle(id, updateVehicleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle' })
  deleteVehicle(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicle(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Partially update vehicle status' })
  patchVehicleStatus(
    @Param('id') id: string,
    @Body('status') status: VehicleStatus,
  ) {
    return this.vehiclesService.updateVehicleStatus(id, status);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update vehicle status' })
  updateVehicleStatus(
    @Param('id') id: string,
    @Body('status') status: VehicleStatus,
  ) {
    return this.vehiclesService.updateVehicleStatus(id, status);
  }

  // Vehicle Assignment Endpoints
  @Post('assignments')
  @ApiOperation({ summary: 'Assign vehicle to driver' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Assignment created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Driver already has active assignment' })
  assignVehicle(@Body() createAssignmentDto: CreateVehicleAssignmentDto) {
    return this.vehiclesService.assignVehicle(createAssignmentDto);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get vehicle assignments with optional filters' })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'driverId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AssignmentStatus })
  getAssignments(
    @Query('vehicleId') vehicleId?: string,
    @Query('driverId') driverId?: string,
    @Query('status') status?: AssignmentStatus,
  ) {
    return this.vehiclesService.getAssignments(vehicleId, driverId, status);
  }

  @Get('assignments/:id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  getAssignmentById(@Param('id') id: string) {
    return this.vehiclesService.getAssignmentById(id);
  }

  @Put('assignments/:id')
  @ApiOperation({ summary: 'Update an assignment' })
  updateAssignment(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateVehicleAssignmentDto,
  ) {
    return this.vehiclesService.updateAssignment(id, updateAssignmentDto);
  }

  @Put('assignments/:id/end')
  @ApiOperation({ summary: 'End an assignment' })
  endAssignment(@Param('id') id: string) {
    return this.vehiclesService.endAssignment(id);
  }

  @Get('drivers/:driverId/active-assignment')
  @ApiOperation({ summary: 'Get active assignment for driver' })
  getActiveAssignmentForDriver(@Param('driverId') driverId: string) {
    return this.vehiclesService.getActiveAssignmentForDriver(driverId);
  }

  @Get(':vehicleId/active-assignment')
  @ApiOperation({ summary: 'Get active assignment for vehicle' })
  getActiveAssignmentForVehicle(@Param('vehicleId') vehicleId: string) {
    return this.vehiclesService.getActiveAssignmentForVehicle(vehicleId);
  }

  // Vehicle Media Endpoints
  @Post('media')
  @ApiOperation({ summary: 'Upload media for a vehicle' })
  uploadMedia(
    @Body() createMediaDto: CreateVehicleMediaDto,
    @Query('uploadedBy') uploadedBy: string,
  ) {
    return this.vehiclesService.uploadMedia(uploadedBy, createMediaDto);
  }

  @Get(':vehicleId/media')
  @ApiOperation({ summary: 'Get media for a vehicle' })
  @ApiQuery({ name: 'type', required: false })
  getMediaForVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query('type') type?: string,
  ) {
    return this.vehiclesService.getMediaForVehicle(vehicleId, type);
  }

  @Delete('media/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media' })
  deleteMedia(@Param('id') id: string) {
    return this.vehiclesService.deleteMedia(id);
  }

  // Vehicle Pricing Endpoints
  @Post('pricing')
  @ApiOperation({ summary: 'Create pricing configuration for vehicle-branch' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pricing created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Pricing already exists' })
  createPricing(@Body() createPricingDto: CreateVehiclePricingDto) {
    return this.vehiclesService.createPricing(createPricingDto);
  }

  @Get('pricing')
  @ApiOperation({ summary: 'Get pricing configurations' })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'branchId', required: false })
  getPricing(
    @Query('vehicleId') vehicleId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.vehiclesService.getPricing(vehicleId, branchId);
  }

  @Get('pricing/:id')
  @ApiOperation({ summary: 'Get pricing by ID' })
  getPricingById(@Param('id') id: string) {
    return this.vehiclesService.getPricingById(id);
  }

  @Put('pricing/:id')
  @ApiOperation({ summary: 'Update pricing configuration' })
  updatePricing(
    @Param('id') id: string,
    @Body() updatePricingDto: UpdateVehiclePricingDto,
  ) {
    return this.vehiclesService.updatePricing(id, updatePricingDto);
  }

  @Delete('pricing/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pricing configuration' })
  deletePricing(@Param('id') id: string) {
    return this.vehiclesService.deletePricing(id);
  }

  @Post('pricing/calculate-wait-charge')
  @ApiOperation({ summary: 'Calculate wait time charge and QPoints deduction' })
  calculateWaitTimeCharge(
    @Body('vehicleId') vehicleId: string,
    @Body('branchId') branchId: string,
    @Body('actualWaitTimeMinutes') actualWaitTimeMinutes: number,
  ) {
    return this.vehiclesService.calculateWaitTimeCharge(
      vehicleId,
      branchId,
      actualWaitTimeMinutes,
    );
  }
}
