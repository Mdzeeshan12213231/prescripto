import prescriptionModel from "../models/prescriptionModel.js";
import testResultModel from "../models/testResultModel.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary';

// API to create prescription (Doctor only)
const createPrescription = async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            diagnosis,
            symptoms,
            medications,
            testsRecommended,
            instructions,
            followUpDate
        } = req.body;

        const { docId } = req.body; // From auth middleware

        // Validate required fields
        if (!patientId || !appointmentId || !diagnosis || !medications) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Get patient information
        const patient = await userModel.findById(patientId).select('name dob gender');
        if (!patient) {
            return res.json({ success: false, message: 'Patient not found' });
        }

        // Get doctor information
        const doctor = await doctorModel.findById(docId).select('name specialization');
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        // Calculate patient age
        const today = new Date();
        const birthDate = new Date(patient.dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const patientAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

        // Create prescription data
        const prescriptionData = {
            patientId,
            patientName: patient.name,
            patientAge,
            patientGender: patient.gender,
            doctorId: docId,
            doctorName: doctor.name,
            doctorSpecialization: doctor.specialization,
            appointmentId,
            diagnosis,
            symptoms: symptoms || [],
            medications: medications.map(med => ({
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions || '',
                beforeAfterMeal: med.beforeAfterMeal || 'After Meal'
            })),
            testsRecommended: testsRecommended || [],
            instructions: instructions || '',
            followUpDate: followUpDate ? new Date(followUpDate) : null
        };

        const newPrescription = new prescriptionModel(prescriptionData);
        await newPrescription.save();

        res.json({ 
            success: true, 
            message: 'Prescription created successfully',
            prescription: newPrescription
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get prescriptions by patient (User)
const getPatientPrescriptions = async (req, res) => {
    try {
        const { userId } = req.body;

        const prescriptions = await prescriptionModel.find({ patientId: userId })
            .sort({ createdAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get prescriptions by doctor (Doctor)
const getDoctorPrescriptions = async (req, res) => {
    try {
        const { docId } = req.body;

        const prescriptions = await prescriptionModel.find({ doctorId: docId })
            .sort({ createdAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all prescriptions (Admin)
const getAllPrescriptions = async (req, res) => {
    try {
        const prescriptions = await prescriptionModel.find()
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        res.json({ success: true, prescriptions });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get single prescription details
const getPrescriptionDetails = async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        const prescription = await prescriptionModel.findById(prescriptionId)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization phone')
            .populate('appointmentId', 'slotDate slotTime');

        if (!prescription) {
            return res.json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, prescription });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update prescription (Doctor only)
const updatePrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const updateData = req.body;
        const { docId } = req.body;

        // Check if prescription exists and belongs to doctor
        const prescription = await prescriptionModel.findById(prescriptionId);
        if (!prescription) {
            return res.json({ success: false, message: 'Prescription not found' });
        }

        if (prescription.doctorId.toString() !== docId) {
            return res.json({ success: false, message: 'Unauthorized to update this prescription' });
        }

        // Update prescription
        const updatedPrescription = await prescriptionModel.findByIdAndUpdate(
            prescriptionId,
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        );

        res.json({ 
            success: true, 
            message: 'Prescription updated successfully',
            prescription: updatedPrescription
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to create test result (Doctor/Lab)
const createTestResult = async (req, res) => {
    try {
        const {
            patientId,
            testName,
            testType,
            testDate,
            results,
            laboratoryName,
            laboratoryAddress,
            analysis,
            comments,
            recommendations,
            priority
        } = req.body;

        const { docId } = req.body; // From auth middleware

        // Validate required fields
        if (!patientId || !testName || !testType || !testDate || !results) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        // Get patient information
        const patient = await userModel.findById(patientId).select('name');
        if (!patient) {
            return res.json({ success: false, message: 'Patient not found' });
        }

        // Get doctor information
        const doctor = await doctorModel.findById(docId).select('name');
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        // Handle file uploads if any
        let reportFile = null;
        let images = [];

        if (req.files) {
            if (req.files.reportFile) {
                const reportUpload = await cloudinary.uploader.upload(req.files.reportFile.path, {
                    resource_type: "auto",
                    folder: "test-reports"
                });
                reportFile = reportUpload.secure_url;
            }

            if (req.files.images) {
                const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
                for (const file of imageFiles) {
                    const imageUpload = await cloudinary.uploader.upload(file.path, {
                        resource_type: "image",
                        folder: "test-images"
                    });
                    images.push(imageUpload.secure_url);
                }
            }
        }

        // Create test result data
        const testResultData = {
            patientId,
            patientName: patient.name,
            testName,
            testType,
            testDate: new Date(testDate),
            resultDate: new Date(),
            results: results.map(result => ({
                parameter: result.parameter,
                value: result.value,
                unit: result.unit || '',
                normalRange: result.normalRange || '',
                status: result.status || 'Normal',
                remarks: result.remarks || ''
            })),
            doctorId: docId,
            doctorName: doctor.name,
            laboratoryName: laboratoryName || '',
            laboratoryAddress: laboratoryAddress || '',
            reportFile,
            images,
            analysis: analysis || '',
            comments: comments || '',
            recommendations: recommendations || '',
            priority: priority || 'Routine',
            status: 'Completed'
        };

        const newTestResult = new testResultModel(testResultData);
        await newTestResult.save();

        res.json({ 
            success: true, 
            message: 'Test result created successfully',
            testResult: newTestResult
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get test results by patient (User)
const getPatientTestResults = async (req, res) => {
    try {
        const { userId } = req.body;

        const testResults = await testResultModel.find({ patientId: userId })
            .sort({ createdAt: -1 });

        res.json({ success: true, testResults });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get test results by doctor (Doctor)
const getDoctorTestResults = async (req, res) => {
    try {
        const { docId } = req.body;

        const testResults = await testResultModel.find({ doctorId: docId })
            .sort({ createdAt: -1 });

        res.json({ success: true, testResults });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all test results (Admin)
const getAllTestResults = async (req, res) => {
    try {
        const testResults = await testResultModel.find()
            .populate('patientId', 'name email')
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        res.json({ success: true, testResults });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get single test result details
const getTestResultDetails = async (req, res) => {
    try {
        const { testResultId } = req.params;

        const testResult = await testResultModel.findById(testResultId)
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization phone');

        if (!testResult) {
            return res.json({ success: false, message: 'Test result not found' });
        }

        res.json({ success: true, testResult });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to update test result (Doctor/Lab)
const updateTestResult = async (req, res) => {
    try {
        const { testResultId } = req.params;
        const updateData = req.body;
        const { docId } = req.body;

        // Check if test result exists and belongs to doctor
        const testResult = await testResultModel.findById(testResultId);
        if (!testResult) {
            return res.json({ success: false, message: 'Test result not found' });
        }

        if (testResult.doctorId && testResult.doctorId.toString() !== docId) {
            return res.json({ success: false, message: 'Unauthorized to update this test result' });
        }

        // Update test result
        const updatedTestResult = await testResultModel.findByIdAndUpdate(
            testResultId,
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        );

        res.json({ 
            success: true, 
            message: 'Test result updated successfully',
            testResult: updatedTestResult
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get prescription statistics (Admin)
const getPrescriptionStats = async (req, res) => {
    try {
        const totalPrescriptions = await prescriptionModel.countDocuments();
        const activePrescriptions = await prescriptionModel.countDocuments({ status: 'Active' });
        const completedPrescriptions = await prescriptionModel.countDocuments({ status: 'Completed' });

        // Get prescriptions by month for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await prescriptionModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.json({
            success: true,
            stats: {
                total: totalPrescriptions,
                active: activePrescriptions,
                completed: completedPrescriptions,
                monthlyStats
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
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
}; 