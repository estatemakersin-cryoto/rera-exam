const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteChapter12() {
  try {
    const chapter = await prisma.chapter.findFirst({
      where: { chapterNumber: 12 }
    });

    if (!chapter) {
      console.log('Chapter 12 not found!');
      return;
    }

    console.log(`Found: ${chapter.titleEn} (ID: ${chapter.id})`);

    const questions = await prisma.question.findMany({
      where: { chapterId: chapter.id },
      select: { id: true }
    });

    const questionIds = questions.map(q => q.id);
    console.log(`Found ${questionIds.length} questions`);

    if (questionIds.length > 0) {
      const deletedResponses = await prisma.response.deleteMany({
        where: { questionId: { in: questionIds } }
      });
      console.log(`Deleted ${deletedResponses.count} responses`);
    }

    const deletedQuestions = await prisma.question.deleteMany({
      where: { chapterId: chapter.id }
    });
    console.log(`Deleted ${deletedQuestions.count} questions`);

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteChapter12();