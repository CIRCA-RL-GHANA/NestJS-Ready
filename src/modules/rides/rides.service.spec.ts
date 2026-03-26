import { Test, TestingModule } from '@nestjs/testing';
import { RidesService } from './rides.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ride } from '../entities/ride.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { LocationService } from '../location/location.service';

describe('RidesService', () => {
  let service: RidesService;
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockVehiclesService = {
    findAvailable: jest.fn(),
    updateLocation: jest.fn(),
  };

  const mockLocationService = {
    calculateDistance: jest.fn(),
    estimateTime: jest.fn(),
    getNearbyDrivers: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        RidesService,
        {
          provide: getRepositoryToken(Ride),
          useValue: mockRepository,
        },
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    }).compile();

    service = module.get<RidesService>(RidesService);
  });

  describe('requestRide', () => {
    it('should create a new ride request', async () => {
      const requestDto = {
        passengerId: 'pass1',
        pickupLat: 40.7128,
        pickupLng: -74.006,
        dropoffLat: 40.758,
        dropoffLng: -73.9855,
        rideType: 'ECONOMY',
      };

      const mockRide = { id: 'ride1', status: 'REQUESTED', ...requestDto };
      mockRepository.save.mockResolvedValue(mockRide);
      mockLocationService.calculateDistance.mockReturnValue(5.0);
      mockLocationService.estimateTime.mockReturnValue(15);

      const result = await service.requestRide(requestDto);

      expect(result.status).toBe('REQUESTED');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('acceptRide', () => {
    it('should accept a ride request', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.acceptRide('ride1', 'driver1');

      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('findNearbyDrivers', () => {
    it('should find available drivers nearby', async () => {
      const mockDrivers = [
        { id: 'driver1', lat: 40.7128, lng: -74.006 },
        { id: 'driver2', lat: 40.715, lng: -74.008 },
      ];

      mockLocationService.getNearbyDrivers.mockResolvedValue(mockDrivers);

      const result = await service.findNearbyDrivers(40.7128, -74.006, 5);

      expect(result).toHaveLength(2);
      expect(mockLocationService.getNearbyDrivers).toHaveBeenCalled();
    });
  });

  describe('cancelRide', () => {
    it('should cancel a ride', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.cancelRide('ride1', 'Passenger changed mind');

      expect(mockRepository.update).toHaveBeenCalled();
    });
  });
});
