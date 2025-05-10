import mongoose from 'mongoose';

const appSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  lastUpdatedBy: { type: String }, // Store the admin's chatId who last updated settings
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);
export { AppSettings }; 