import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignMetric extends Document {
  campaign_id: mongoose.Types.ObjectId;
  date: Date;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversion: number;
}

const CampaignMetricSchema: Schema = new Schema({
  campaign_id: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  date: { type: Date, required: true },
  spent: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  conversion: { type: Number, default: 0 }
});

CampaignMetricSchema.index({ campaign_id: 1, date: 1 });

export default mongoose.model<ICampaignMetric>('CampaignMetric', CampaignMetricSchema);
