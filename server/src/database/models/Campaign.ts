import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  account_id: mongoose.Types.ObjectId;
  title: string;
  status: 'active' | 'paused';
  objective: string;
  budget: number;
  budget_type: 'daily' | 'lifetime';
  spent: number;
  impressions: number;
  clicks: number;
  results: number;
  cost_per_result: number;
  start_date: Date;
  end_date?: Date;
  createdAt: Date;
}

const CampaignSchema: Schema = new Schema({
  account_id: { type: Schema.Types.ObjectId, ref: 'AdAccount', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  objective: { type: String, default: 'CONVERSIONS' },
  budget: { type: Number, required: true },
  budget_type: { type: String, enum: ['daily', 'lifetime'], default: 'daily' },
  spent: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  results: { type: Number, default: 0 },
  cost_per_result: { type: Number, default: 0 },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
