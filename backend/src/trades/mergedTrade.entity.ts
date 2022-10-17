import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Double,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { Trade } from './trade.entity';

export enum TradeDirection {
  'LONG',
  'SHORT',
}

@Entity()
@Index(['entryDate', 'exitDate'], { unique: true })
export class MergedTrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  entryDate: Date;

  @Column()
  exitDate: Date;

  @Column()
  symbol: string;

  @Column({
    type: 'enum',
    enum: TradeDirection,
  })
  direction: TradeDirection;

  @Column({ type: 'double' })
  entryPrice: Double;

  @Column({ type: 'double' })
  exitPrice: Double;

  @Column({ type: 'double' })
  size: Double;

  @Column({ type: 'double' })
  pnl: Double;

  @Column({ type: 'double' })
  pnlPercentage: Double;

  @Column({ type: 'double' })
  fee: Double;

  @Column()
  feeAsset: string;

  @OneToMany((type) => Trade, (entryTrade) => entryTrade.mergedAsEntryTrade)
  entryTrades: Trade[];

  @OneToMany((type) => Trade, (entryTrade) => entryTrade.mergedAsEntryTrade)
  exitTrades: Trade[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
