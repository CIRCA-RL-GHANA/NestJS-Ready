import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VehicleBand } from './entities/vehicle-band.entity';
import { VehicleBandMembership } from './entities/vehicle-band-membership.entity';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { VehicleAssignment, AssignmentStatus } from './entities/vehicle-assignment.entity';
import { VehicleMedia } from './entities/vehicle-media.entity';
import { VehiclePricing } from './entities/vehicle-pricing.entity';
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
import { AIPricingService } from '../ai/services/ai-pricing.service';
import { AISearchService } from '../ai/services/ai-search.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleBand)
    private vehicleBandRepository: Repository<VehicleBand>,
    @InjectRepository(VehicleBandMembership)
    private membershipRepository: Repository<VehicleBandMembership>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(VehicleAssignment)
    private assignmentRepository: Repository<VehicleAssignment>,
    @InjectRepository(VehicleMedia)
    private mediaRepository: Repository<VehicleMedia>,
    @InjectRepository(VehiclePricing)
    private pricingRepository: Repository<VehiclePricing>,
    private dataSource: DataSource,
    private readonly aiPricing: AIPricingService,
    private readonly aiSearch: AISearchService,
  ) {}

  // Vehicle Band Management
  async createBand(managerId: string, createBandDto: CreateVehicleBandDto): Promise<VehicleBand> {
    // Check if manager already has a band (ONE band per manager rule)
    const existingBand = await this.vehicleBandRepository.findOne({
      where: { managerId },
    });

    if (existingBand) {
      throw new ConflictException('Manager can only create ONE vehicle band');
    }

    const band = this.vehicleBandRepository.create({
      ...createBandDto,
      managerId,
    });

    return await this.vehicleBandRepository.save(band);
  }

  async getBands(
    branchId?: string,
    managerId?: string,
    isActive?: boolean,
  ): Promise<VehicleBand[]> {
    const query = this.vehicleBandRepository.createQueryBuilder('band');

    if (branchId) {
      query.andWhere('band.branchId = :branchId', { branchId });
    }

    if (managerId) {
      query.andWhere('band.managerId = :managerId', { managerId });
    }

    if (isActive !== undefined) {
      query.andWhere('band.isActive = :isActive', { isActive });
    }

    return await query.getMany();
  }

  async getBandById(id: string): Promise<VehicleBand> {
    const band = await this.vehicleBandRepository.findOne({ where: { id } });

    if (!band) {
      throw new NotFoundException('Vehicle band not found');
    }

    return band;
  }

  async updateBand(
    id: string,
    managerId: string,
    updateBandDto: UpdateVehicleBandDto,
  ): Promise<VehicleBand> {
    const band = await this.getBandById(id);

    // Ensure manager owns the band
    if (band.managerId !== managerId) {
      throw new ConflictException('You can only update your own vehicle band');
    }

    Object.assign(band, updateBandDto);
    return await this.vehicleBandRepository.save(band);
  }

  async deleteBand(id: string, managerId: string): Promise<void> {
    const band = await this.getBandById(id);

    // Ensure manager owns the band
    if (band.managerId !== managerId) {
      throw new ConflictException('You can only delete your own vehicle band');
    }

    await this.vehicleBandRepository.softDelete(id);
  }

  // Band Membership Management
  async addVehicleToBand(dto: AddVehicleToBandDto): Promise<VehicleBandMembership> {
    // Check if vehicle exists
    const vehicle = await this.vehicleRepository.findOne({ where: { id: dto.vehicleId } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if band exists
    const band = await this.vehicleBandRepository.findOne({ where: { id: dto.bandId } });
    if (!band) {
      throw new NotFoundException('Vehicle band not found');
    }

    // Check if membership already exists
    const existing = await this.membershipRepository.findOne({
      where: {
        vehicleId: dto.vehicleId,
        bandId: dto.bandId,
      },
    });

    if (existing) {
      throw new ConflictException('Vehicle is already in this band');
    }

    const membership = this.membershipRepository.create(dto);
    return await this.membershipRepository.save(membership);
  }

  async removeMembershipById(id: string): Promise<void> {
    const membership = await this.membershipRepository.findOne({
      where: { id },
    });

    if (!membership) {
      throw new NotFoundException('Band membership not found');
    }

    await this.membershipRepository.softDelete(membership.id);
  }

  async removeVehicleFromBand(vehicleId: string, bandId: string): Promise<void> {
    const membership = await this.membershipRepository.findOne({
      where: { vehicleId, bandId },
    });

    if (!membership) {
      throw new NotFoundException('Vehicle is not in this band');
    }

    await this.membershipRepository.softDelete(membership.id);
  }

  async getVehiclesInBand(bandId: string): Promise<Vehicle[]> {
    const memberships = await this.membershipRepository.find({
      where: { bandId },
    });

    const vehicleIds = memberships.map((m) => m.vehicleId);

    if (vehicleIds.length === 0) {
      return [];
    }

    return await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .whereInIds(vehicleIds)
      .getMany();
  }

  async getBandsForVehicle(vehicleId: string): Promise<VehicleBand[]> {
    const memberships = await this.membershipRepository.find({
      where: { vehicleId },
    });

    const bandIds = memberships.map((m) => m.bandId);

    if (bandIds.length === 0) {
      return [];
    }

    return await this.vehicleBandRepository
      .createQueryBuilder('band')
      .whereInIds(bandIds)
      .getMany();
  }

  // Vehicle Management
  async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Check for duplicate plate number
    const existing = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });

    if (existing) {
      throw new ConflictException('Vehicle with this plate number already exists');
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async getVehicles(branchId?: string, status?: VehicleStatus, type?: string): Promise<Vehicle[]> {
    const query = this.vehicleRepository.createQueryBuilder('vehicle');

    if (branchId) {
      query.andWhere('vehicle.branchId = :branchId', { branchId });
    }

    if (status) {
      query.andWhere('vehicle.status = :status', { status });
    }

    if (type) {
      query.andWhere('vehicle.type = :type', { type });
    }

    return await query.getMany();
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async getVehicleByPlateNumber(plateNumber: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { plateNumber } });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);

    // If updating plate number, check for duplicates
    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== vehicle.plateNumber) {
      const existing = await this.vehicleRepository.findOne({
        where: { plateNumber: updateVehicleDto.plateNumber },
      });

      if (existing) {
        throw new ConflictException('Vehicle with this plate number already exists');
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return await this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.getVehicleById(id);
    await this.vehicleRepository.softDelete(id);
  }

  async updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);
    vehicle.status = status;
    return await this.vehicleRepository.save(vehicle);
  }

  // Vehicle Assignment Management
  async assignVehicle(createAssignmentDto: CreateVehicleAssignmentDto): Promise<VehicleAssignment> {
    // Check if vehicle exists
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createAssignmentDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if driver already has an active assignment
    const activeAssignment = await this.assignmentRepository.findOne({
      where: {
        driverId: createAssignmentDto.driverId,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (activeAssignment) {
      throw new ConflictException('Driver already has an active vehicle assignment');
    }

    const assignment = this.assignmentRepository.create(createAssignmentDto);
    return await this.assignmentRepository.save(assignment);
  }

  async getAssignments(
    vehicleId?: string,
    driverId?: string,
    status?: AssignmentStatus,
  ): Promise<VehicleAssignment[]> {
    const query = this.assignmentRepository.createQueryBuilder('assignment');

    if (vehicleId) {
      query.andWhere('assignment.vehicleId = :vehicleId', { vehicleId });
    }

    if (driverId) {
      query.andWhere('assignment.driverId = :driverId', { driverId });
    }

    if (status) {
      query.andWhere('assignment.status = :status', { status });
    }

    return await query.getMany();
  }

  async getAssignmentById(id: string): Promise<VehicleAssignment> {
    const assignment = await this.assignmentRepository.findOne({ where: { id } });

    if (!assignment) {
      throw new NotFoundException('Vehicle assignment not found');
    }

    return assignment;
  }

  async updateAssignment(
    id: string,
    updateAssignmentDto: UpdateVehicleAssignmentDto,
  ): Promise<VehicleAssignment> {
    const assignment = await this.getAssignmentById(id);

    Object.assign(assignment, updateAssignmentDto);
    return await this.assignmentRepository.save(assignment);
  }

  async endAssignment(id: string): Promise<VehicleAssignment> {
    const assignment = await this.getAssignmentById(id);
    assignment.status = AssignmentStatus.COMPLETED;
    assignment.endDate = new Date();
    return await this.assignmentRepository.save(assignment);
  }

  async getActiveAssignmentForDriver(driverId: string): Promise<VehicleAssignment | null> {
    return await this.assignmentRepository.findOne({
      where: {
        driverId,
        status: AssignmentStatus.ACTIVE,
      },
    });
  }

  async getActiveAssignmentForVehicle(vehicleId: string): Promise<VehicleAssignment | null> {
    return await this.assignmentRepository.findOne({
      where: {
        vehicleId,
        status: AssignmentStatus.ACTIVE,
      },
    });
  }

  // Vehicle Media Management
  async uploadMedia(
    uploadedBy: string,
    createMediaDto: CreateVehicleMediaDto,
  ): Promise<VehicleMedia> {
    // Check if vehicle exists
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createMediaDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const media = this.mediaRepository.create({
      ...createMediaDto,
      uploadedBy,
    });

    return await this.mediaRepository.save(media);
  }

  async getMediaForVehicle(vehicleId: string, type?: string): Promise<VehicleMedia[]> {
    const query = this.mediaRepository.createQueryBuilder('media');
    query.where('media.vehicleId = :vehicleId', { vehicleId });

    if (type) {
      query.andWhere('media.type = :type', { type });
    }

    return await query.getMany();
  }

  async deleteMedia(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.mediaRepository.softDelete(id);
  }

  // Vehicle Pricing Management
  async createPricing(createPricingDto: CreateVehiclePricingDto): Promise<VehiclePricing> {
    // Check if vehicle exists
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createPricingDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check for duplicate (vehicle-branch combination must be unique)
    const existing = await this.pricingRepository.findOne({
      where: {
        vehicleId: createPricingDto.vehicleId,
        branchId: createPricingDto.branchId,
      },
    });

    if (existing) {
      throw new ConflictException('Pricing already exists for this vehicle-branch combination');
    }

    const pricing = this.pricingRepository.create(createPricingDto);
    return await this.pricingRepository.save(pricing);
  }

  async getPricing(vehicleId?: string, branchId?: string): Promise<VehiclePricing[]> {
    const query = this.pricingRepository.createQueryBuilder('pricing');

    if (vehicleId) {
      query.andWhere('pricing.vehicleId = :vehicleId', { vehicleId });
    }

    if (branchId) {
      query.andWhere('pricing.branchId = :branchId', { branchId });
    }

    return await query.getMany();
  }

  async getPricingById(id: string): Promise<VehiclePricing> {
    const pricing = await this.pricingRepository.findOne({ where: { id } });

    if (!pricing) {
      throw new NotFoundException('Pricing configuration not found');
    }

    return pricing;
  }

  async updatePricing(
    id: string,
    updatePricingDto: UpdateVehiclePricingDto,
  ): Promise<VehiclePricing> {
    const pricing = await this.getPricingById(id);

    Object.assign(pricing, updatePricingDto);
    return await this.pricingRepository.save(pricing);
  }

  async deletePricing(id: string): Promise<void> {
    await this.getPricingById(id);
    await this.pricingRepository.softDelete(id);
  }

  async calculateWaitTimeCharge(
    vehicleId: string,
    branchId: string,
    actualWaitTimeMinutes: number,
  ): Promise<{ charge: number; qPointsToDeduct: number; minutesExceeded: number }> {
    const pricing = await this.pricingRepository.findOne({
      where: { vehicleId, branchId },
    });

    if (!pricing) {
      throw new NotFoundException(
        'Pricing configuration not found for this vehicle-branch combination',
      );
    }

    if (actualWaitTimeMinutes <= pricing.allowableWaitTime) {
      return {
        charge: 0,
        qPointsToDeduct: 0,
        minutesExceeded: 0,
      };
    }

    const minutesExceeded = actualWaitTimeMinutes - pricing.allowableWaitTime;
    const charge = minutesExceeded * Number(pricing.pricePerMinute);
    const qPointsToDeduct = minutesExceeded * 1.5; // 1.5 QPoints per minute exceeded

    return {
      charge: Number(charge.toFixed(2)),
      qPointsToDeduct: Number(qPointsToDeduct.toFixed(2)),
      minutesExceeded,
    };
  }

  /**
   * AI: Suggest an optimal dynamic price for a vehicle given demand context.
   */
  async getAIDynamicPrice(
    vehicleId: string,
    basePrice: number,
    demandFactor: number,
  ): Promise<{ suggestedPrice: number; confidence: number }> {
    try {
      const surge = this.aiPricing.computeSurgeMultiplier(demandFactor, 1.0);
      return { suggestedPrice: parseFloat((basePrice * surge).toFixed(2)), confidence: 0.75 };
    } catch {
      return { suggestedPrice: basePrice, confidence: 0 };
    }
  }

  /**
   * AI: Semantic search across available vehicles using natural-language query.
   */
  async searchVehiclesAI(query: string): Promise<{ vehicleId: string; score: number }[]> {
    try {
      const vehicles = await this.vehicleRepository.find({ take: 200 });
      const corpus = vehicles.map((v) => ({
        id: v.id,
        text: `${v.plateNumber} ${(v as any).type ?? ''} ${(v as any).model ?? ''} ${(v as any).color ?? ''}`.trim(),
      }));
      const results = await this.aiSearch.rankCandidates(query, corpus);
      return results.map((r) => ({ vehicleId: r.id, score: r.score }));
    } catch {
      return [];
    }
  }
}
