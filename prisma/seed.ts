// ══════════════════════════════════════════════════════════════════════════════
// PATH: prisma/seed.ts
// REPLACE ENTIRE FILE WITH THIS:
// ══════════════════════════════════════════════════════════════════════════════

import { PrismaClient, ConfigDataType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ────────────────────────────────────────────────────────────────────────────
  // SYSTEM CONFIGURATIONS
  // ────────────────────────────────────────────────────────────────────────────
  
  const configs = [
    // PRICING
    { key: 'exam_package_price', value: '750', label: 'Exam Package Price (₹)', description: 'Price for B2C exam package in INR', category: 'PRICING', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: true },
    { key: 'exam_package_tests', value: '5', label: 'Tests Per Package', description: 'Number of mock tests included in package', category: 'PRICING', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: true },
    { key: 'exam_package_validity_days', value: '100', label: 'Package Validity (Days)', description: 'Number of days package remains valid after purchase', category: 'PRICING', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: true },

    // EXAM SETTINGS
    { key: 'exam_duration_minutes', value: '60', label: 'Exam Duration (Minutes)', description: 'Duration of mock test in minutes', category: 'EXAM', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: true },
    { key: 'exam_total_questions', value: '50', label: 'Total Questions', description: 'Number of questions per test', category: 'EXAM', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: true },
    { key: 'exam_passing_percentage', value: '40', label: 'Passing Percentage', description: 'Minimum percentage required to pass', category: 'EXAM', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: true },

    // INSTITUTE SETTINGS
    { key: 'default_revenue_share', value: '20', label: 'Default Revenue Share (%)', description: 'Default percentage of revenue shared with institutes', category: 'INSTITUTE', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: false },
    { key: 'max_batch_size', value: '50', label: 'Max Batch Size', description: 'Maximum students per batch', category: 'INSTITUTE', dataType: ConfigDataType.NUMBER, isEditable: true, isPublic: false },
    { key: 'certificate_prefix', value: 'RERA', label: 'Certificate Prefix', description: 'Prefix for certificate numbers (e.g., RERA-2025-00001)', category: 'INSTITUTE', dataType: ConfigDataType.STRING, isEditable: true, isPublic: false },

    // PLATFORM
    { key: 'platform_name', value: 'EstateMakers', label: 'Platform Name', description: 'Name displayed across the platform', category: 'PLATFORM', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },
    { key: 'support_phone', value: '8850150878', label: 'Support Phone', description: 'Primary support contact number', category: 'PLATFORM', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },
    { key: 'support_phone_2', value: '9699091086', label: 'Support Phone 2', description: 'Secondary support contact number', category: 'PLATFORM', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },
    { key: 'support_email', value: 'estatemakers.in@gmail.com', label: 'Support Email', description: 'Support email address', category: 'PLATFORM', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },

    // PAYMENT
    { key: 'upi_id', value: 'vaishkamath@oksbi', label: 'UPI ID', description: 'UPI ID for receiving payments', category: 'PAYMENT', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },
    { key: 'upi_name', value: 'Vaishali Kamath', label: 'UPI Name', description: 'Name associated with UPI ID', category: 'PAYMENT', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },
    { key: 'upi_phone', value: '9699091086', label: 'UPI Phone', description: 'Phone number for UPI payments', category: 'PAYMENT', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },

    // WHATSAPP
    { key: 'whatsapp_group_link', value: 'https://chat.whatsapp.com/BlEjmFbOk1O1w809vKHSHW', label: 'WhatsApp Group Link', description: 'Official WhatsApp group invite link', category: 'WHATSAPP', dataType: ConfigDataType.STRING, isEditable: true, isPublic: true },
  ];

  console.log('📝 Seeding system configurations...');
  
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {
        value: config.value,
        label: config.label,
        description: config.description,
        category: config.category,
        dataType: config.dataType,
        isEditable: config.isEditable,
        isPublic: config.isPublic,
      },
      create: config,
    });
  }

  console.log(`✅ Seeded ${configs.length} configurations`);

  // ────────────────────────────────────────────────────────────────────────────
  // CREATE SUPER ADMIN USER
  // ────────────────────────────────────────────────────────────────────────────
  
  const adminExists = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!adminExists) {
    console.log('👤 Creating super admin user...');
    
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    await prisma.user.create({
      data: {
        fullName: 'Admin',
        email: 'admin@estatemakers.in',
        mobile: '8850150878',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        isAdmin: true,
        isActive: true,
        isVerified: true,
        referralCode: 'ADMIN001',
      },
    });
    
    console.log('✅ Super admin created');
    console.log('   Email: admin@estatemakers.in');
    console.log('   Password: Admin@123');
    console.log('⚠️  IMPORTANT: Change admin password immediately!');
  } else {
    console.log('ℹ️  Super admin already exists, skipping...');
  }

  console.log('');
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });