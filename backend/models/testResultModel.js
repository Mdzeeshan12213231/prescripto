import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
    // Basic Information
    testResultId: {
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
    
    // Test Information
    testName: {
        type: String,
        required: true
    },
    testType: {
        type: String,
        required: true,
        enum: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Ultrasound', 'Other']
    },
    
    // Test Details
    testDate: {
        type: Date,
        required: true
    },
    resultDate: {
        type: Date,
        required: true
    },
    
    // Test Results
    results: [{
        parameter: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        unit: {
            type: String
        },
        normalRange: {
            type: String
        },
        status: {
            type: String,
            enum: ['Normal', 'High', 'Low', 'Critical'],
            default: 'Normal'
        },
        remarks: {
            type: String
        }
    }],
    
    // Doctor Information
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctor'
    },
    doctorName: {
        type: String
    },
    
    // Laboratory Information
    laboratoryName: {
        type: String
    },
    laboratoryAddress: {
        type: String
    },
    
    // File Attachments
    reportFile: {
        type: String // URL to uploaded report file
    },
    images: [{
        type: String // URLs to uploaded images
    }],
    
    // Analysis and Comments
    analysis: {
        type: String
    },
    comments: {
        type: String
    },
    recommendations: {
        type: String
    },
    
    // Status
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    
    // Priority
    priority: {
        type: String,
        enum: ['Routine', 'Urgent', 'Emergency'],
        default: 'Routine'
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

// Generate test result ID before saving
testResultSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Get count of test results for today
        const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        
        const count = await this.constructor.countDocuments({
            createdAt: { $gte: todayStart, $lt: todayEnd }
        });
        
        const testNumber = String(count + 1).padStart(3, '0');
        this.testResultId = `TEST-${year}${month}${day}-${testNumber}`;
    }
    next();
});

const testResultModel = mongoose.models.testResult || mongoose.model("testResult", testResultSchema);
export default testResultModel; 