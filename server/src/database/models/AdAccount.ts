import mongoose, { Schema, Document } from 'mongoose';

export interface IAdAccount extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  status: 'active' | 'paused';
  createdAt: Date;
}

const AdAccountSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAdAccount>('AdAccount', AdAccountSchema);
