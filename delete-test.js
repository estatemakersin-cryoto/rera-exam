const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up test data...\n');
  
  // 1. Delete all InstituteStudent records
  const students = await prisma.instituteStudent.deleteMany({});
  console.log('Deleted InstituteStudent:', students.count);
  
  // 2. Delete all ExamPayment with TRAINING_COURSE type
  const examPayments = await prisma.examPayment.deleteMany({
    where: { planType: 'TRAINING_COURSE' }
  });
  console.log('Deleted ExamPayment (courses):', examPayments.count);
  
  // 3. Delete all PaymentProof with TRAINING_COURSE type
  const payments = await prisma.paymentProof.deleteMany({
    where: { planType: 'TRAINING_COURSE' }
  });
  console.log('Deleted PaymentProof (courses):', payments.count);
  
  console.log('\n✅ Cleanup done! You can test enrollment again.');
}

main()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect());