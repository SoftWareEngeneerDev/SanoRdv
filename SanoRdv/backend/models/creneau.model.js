

import mongoose from 'mongoose';
import Patient from '../models/patient.model.js';

const creneauSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    timeSlots: [{
        patientId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'patient'
        },
        time: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['disponible', 'reserve', 'indisponible'],
            default: 'disponible'
        },
        // Autres champs nécessaires
    }],
    agenda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agenda'
    }
}, { timestamps: true });

const Creneau = mongoose.model('Creneau', creneauSchema);

export default Creneau;