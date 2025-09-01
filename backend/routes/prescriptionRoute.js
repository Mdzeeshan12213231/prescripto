import express from 'express';
import { 
    createPrescription,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    getAllPrescriptions,
    getPrescriptionDetails,
    updatePrescription,
    createTestResult,
    getPatientTestResults,
    getDoctorTestResults,
    getAllTestResults,
    getTestResultDetails,
    updateTestResult,
    getPrescriptionStats
} from '../controllers/prescriptionController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
import authDoctor from '../middleware/authDoctor.js';
import authAdmin from '../middleware/authAdmin.js';

const prescriptionRouter = express.Router();

// Prescription Routes

// Create prescription (Doctor only)
prescriptionRouter.post("/create", authDoctor, createPrescription);

// Get prescriptions by patient (User)
prescriptionRouter.get("/patient", authUser, getPatientPrescriptions);

// Get prescriptions by doctor (Doctor)
prescriptionRouter.get("/doctor", authDoctor, getDoctorPrescriptions);

// Get all prescriptions (Admin)
prescriptionRouter.get("/all", authAdmin, getAllPrescriptions);

// Get single prescription details (All authenticated users)
prescriptionRouter.get("/details/:prescriptionId", authUser, getPrescriptionDetails);

// Update prescription (Doctor only)
prescriptionRouter.put("/update/:prescriptionId", authDoctor, updatePrescription);

// Test Result Routes

// Create test result (Doctor/Lab)
prescriptionRouter.post("/test/create", authDoctor, upload.fields([
    { name: 'reportFile', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), createTestResult);

// Get test results by patient (User)
prescriptionRouter.get("/test/patient", authUser, getPatientTestResults);

// Get test results by doctor (Doctor)
prescriptionRouter.get("/test/doctor", authDoctor, getDoctorTestResults);

// Get all test results (Admin)
prescriptionRouter.get("/test/all", authAdmin, getAllTestResults);

// Get single test result details (All authenticated users)
prescriptionRouter.get("/test/details/:testResultId", authUser, getTestResultDetails);

// Update test result (Doctor/Lab)
prescriptionRouter.put("/test/update/:testResultId", authDoctor, upload.fields([
    { name: 'reportFile', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), updateTestResult);

// Statistics (Admin only)
prescriptionRouter.get("/stats", authAdmin, getPrescriptionStats);

export default prescriptionRouter; 