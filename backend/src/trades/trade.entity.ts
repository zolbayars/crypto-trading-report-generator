import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Double,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MarketType {
  FUTURES = 'futures',
  SPOT = 'spot',
}

export enum Exchange {
  BINANCE = 'binance',
}

@Entity()
@Index(['exchange', 'exchangeTradeId'], { unique: true })
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  exchangeTradeId: number;

  @Column()
  exchangeOrderId: number;

  @Column()
  symbol: string;

  @Column()
  side: string;

  @Column({ type: 'double' })
  price: Double;

  @Column({ type: 'double' })
  qty: Double;

  @Column({ type: 'double' })
  quoteQty: Double;

  @Column({ type: 'double' })
  realizedPnl: Double;

  @Column()
  marginAsset: string;

  @Column({ type: 'double' })
  commission: Double;

  @Column()
  commissionAsset: string;

  @Column({ type: 'datetime' })
  exchangeCreatedAt: Date;

  @Column()
  positionSide: string;

  @Column()
  isBuyer: boolean;

  @Column()
  isMaker: boolean;

  @Column({
    type: 'enum',
    enum: MarketType,
  })
  marketType: MarketType;

  @Column({
    type: 'enum',
    enum: Exchange,
  })
  exchange: Exchange;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
