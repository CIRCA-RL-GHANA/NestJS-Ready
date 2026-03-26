import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

@Entity('deliveries')
@Index(['orderId'])
@Index(['driverId'])
@Index(['status'])
export class Delivery extends BaseEntity {
  @ApiProperty({ description: 'Order ID' })
  @Column({ type: 'uuid' })
  orderId: string;

  @ApiProperty({ description: 'Driver ID' })
  @Column({ type: 'uuid' })
  driverId: string;

  @ApiProperty({ description: 'Package ID', required: false })
  @Column({ type: 'uuid', nullable: true })
  packageId: string | null;

  @ApiProperty({ description: 'Delivery status', enum: DeliveryStatus })
  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @ApiProperty({ description: 'Pickup location', type: 'object' })
  @Column({ type: 'jsonb' })
  pickupLocation: { lat: number; lng: number; address: string };

  @ApiProperty({ description: 'Delivery location', type: 'object' })
  @Column({ type: 'jsonb' })
  deliveryLocation: { lat: number; lng: number; address: string };

  @ApiProperty({ description: 'Estimated distance in km', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDistance: number | null;

  @ApiProperty({ description: 'Actual distance in km', required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDistance: number | null;

  @ApiProperty({ description: 'When driver picked up package', required: false })
  @Column({ type: 'timestamp', nullable: true })
  pickedUpAt: Date | null;

  @ApiProperty({ description: 'When package was delivered', required: false })
  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @ApiProperty({ description: 'Delivery proof (photo URL)', required: false })
  @Column({ type: 'text', nullable: true })
  proofOfDelivery: string | null;

  @ApiProperty({ description: 'Recipient name', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  recipientName: string | null;

  @ApiProperty({ description: 'Delivery notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Driver rating (1-5)', required: false })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number | null;
}
