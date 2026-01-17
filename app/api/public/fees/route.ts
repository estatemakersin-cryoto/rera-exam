// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC FEES API
// app/api/public/fees/route.ts
// Returns FEES category configs for Agent Guide page (no auth required)
// ══════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all public FEES configs
    const configs = await prisma.systemConfig.findMany({
      where: {
        category: 'FEES',
        isPublic: true,
      },
      select: {
        key: true,
        value: true,
        label: true,
        dataType: true,
      },
    });

    // Convert to key-value object with parsed numbers
    const fees: Record<string, { value: number; label: string }> = {};
    let total = 0;

    for (const config of configs) {
      const numValue = parseInt(config.value, 10);
      fees[config.key] = {
        value: numValue,
        label: config.label,
      };
      total += numValue;
    }

    return NextResponse.json({
      success: true,
      fees,
      total,
      breakdown: [
        {
          key: 'training_fee',
          label: fees.training_fee?.label || 'Training Fee (incl. GST)',
          amount: fees.training_fee?.value || 5900,
        },
        {
          key: 'coc_exam_fee',
          label: fees.coc_exam_fee?.label || 'COC Exam Fee',
          amount: fees.coc_exam_fee?.value || 1500,
        },
        {
          key: 'rera_registration_fee',
          label: fees.rera_registration_fee?.label || 'MahaRERA Registration Fee',
          amount: fees.rera_registration_fee?.value || 11250,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    
    // Return default values if DB fails
    return NextResponse.json({
      success: true,
      fees: {
        training_fee: { value: 5900, label: 'Training Fee (incl. GST)' },
        coc_exam_fee: { value: 1500, label: 'COC Exam Fee' },
        rera_registration_fee: { value: 11250, label: 'MahaRERA Registration Fee' },
      },
      total: 18650,
      breakdown: [
        { key: 'training_fee', label: 'Training Fee (incl. GST)', amount: 5900 },
        { key: 'coc_exam_fee', label: 'COC Exam Fee', amount: 1500 },
        { key: 'rera_registration_fee', label: 'MahaRERA Registration Fee', amount: 11250 },
      ],
    });
  }
}