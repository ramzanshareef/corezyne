import { Schema, model, models } from 'mongoose';

const ClientSchema = new Schema({
    name: { type: String, required: true },
    projectNumber: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

export default models.Client || model('Client', ClientSchema);