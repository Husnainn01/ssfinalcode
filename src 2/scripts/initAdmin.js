import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../lib/User.js';

// Initialize dotenv
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}.nzqqw.mongodb.net/carwebsite01?retryWrites=true&w=majority`;

async function dbConnect() {
    try {
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

async function initializeAdmin() {
    try {
        await dbConnect();
        
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        
        // Check if admin exists first
        const existingAdmin = await User.findOne({ email: process.env.ADMIN_ID });
        
        if (existingAdmin) {
            console.log('Admin user already exists, updating...');
        }
        
        // Use the User model instead of direct collection access
        const adminUser = await User.findOneAndUpdate(
            { email: process.env.ADMIN_ID },
            {
                $set: {
                    name: 'Admin',
                    lastName: 'Super',  // Added lastName as it's required
                    email: process.env.ADMIN_ID,
                    password: hashedPassword,
                    role: 'super_admin',
                    status: 'active',
                    avatar: '/default-avatar.png',
                    updatedAt: new Date(),
                    createdAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        if (adminUser) {
            console.log('Admin user created/updated successfully');
            console.log('Admin details:', {
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                status: adminUser.status
            });
        } else {
            console.log('Failed to create/update admin user');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
        if (error.errors) {
            // Log validation errors if any
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation error for ${key}:`, error.errors[key].message);
            });
        }
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Run the initialization
initializeAdmin().then(() => {
    console.log('Admin initialization process completed');
}).catch(error => {
    console.error('Failed to complete admin initialization:', error);
    process.exit(1);
}); 