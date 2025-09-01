import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    // Basic Information
    prescriptionId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Patient Information
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientAge: {
        type: Number,
        required: true
    },
    patientGender: {
        type: String,
        required: true
    },
    
    // Doctor Information
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor',
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    doctorSpecialization: {
        type: String,
        required: true
    },
    
    // Appointment Information
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appointment',
        required: true
    },
    
    // Medical Information
    diagnosis: {
        type: String,
        required: true
    },
    symptoms: [{
        type: String
    }],
    
    // Medications
    medications: [{
        name: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true
        },
        frequency: {
            type: String,
            required: true
        },
        duration: {
            type: String,
            required: true
        },
        instructions: {
            type: String
        },
        beforeAfterMeal: {
            type: String,
            enum: ['Before Meal', 'After Meal', 'Empty Stomach', 'As Needed'],
            default: 'After Meal'
        }
    }],
    
    // Tests Recommended
    testsRecommended: [{
        testName: {
            type: String,
            required: true
        },
        testDescription: {
            type: String
        },
        urgency: {
            type: String,
            enum: ['Routine', 'Urgent', 'Emergency'],
            default: 'Routine'
        }
    }],
    
    // Instructions
    instructions: {
        type: String
    },
    followUpDate: {
        type: Date
    },
    
    // Status
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate prescription ID before saving
prescriptionSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Get count of prescriptions for today
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        const count = await this.constructor.countDocuments({
            createdAt: { $gte: todayStart, $lt: todayEnd }
        });
        
        const prescriptionNumber = String(count + 1).padStart(3, '0');
        this.prescriptionId = `PRES-${year}${month}${day}-${prescriptionNumber}`;
    }
    next();
});

const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);
export default prescriptionModel; 