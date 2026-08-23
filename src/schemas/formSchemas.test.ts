import { describe, expect, it } from 'vitest';
import { contactFormSchema, interestFormSchema } from './formSchemas';

const validInterest = {
  fullName: 'Alya Pratama',
  email: 'alya@example.com',
  phone: '+62 812-3456-7890',
  domicile: 'Bandung',
  ageRange: '18-24',
  programId: 'program-1',
  motivation: 'Saya ingin belajar dan berkontribusi untuk komunitas.',
  consentPrivacy: true,
  website: '',
  formStartedAt: '2026-07-26T10:00:00.000Z',
};

describe('interestFormSchema', () => {
  it('menerima data minat yang lengkap', () => {
    expect(interestFormSchema.safeParse(validInterest).success).toBe(true);
  });

  it('menolak persetujuan privasi yang belum diberikan', () => {
    const result = interestFormSchema.safeParse({
      ...validInterest,
      consentPrivacy: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'consentPrivacy')).toBe(true);
    }
  });
});

describe('contactFormSchema', () => {
  it('menolak email yang tidak valid dan pesan yang terlalu singkat', () => {
    const result = contactFormSchema.safeParse({
      fullName: 'Alya Pratama',
      email: 'bukan-email',
      subject: 'Info program',
      message: 'Singkat',
      consentPrivacy: true,
      website: '',
      formStartedAt: '2026-07-26T10:00:00.000Z',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toContain('email');
      expect(fields).toContain('message');
    }
  });
});
