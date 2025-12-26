import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  user_id: mongoose.Types.ObjectId;
  alert_cost_threshold: number;
  alert_ctr_threshold: number;
  default_daily_budget: number;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  alert_cost_threshold: { type: Number, default: 1000000 }, // 1M VND
  alert_ctr_threshold: { type: Number, default: 1.0 }, // 1%
  default_daily_budget: { type: Number, default: 500000 }, // 500K VND
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
