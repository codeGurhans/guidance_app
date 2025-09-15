const { validateUserProfile } = require('../utils/validation');

describe('User Profile Validation', () => {
  it('should validate valid user profile data', () => {
    const validProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
    };

    const result = validateUserProfile(validProfile);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid age', () => {
    const invalidProfile = {
      age: 5, // Too young
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Age must be a number between 10 and 100');
  });

  it('should reject invalid gender', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Unknown', // Invalid gender
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid gender value');
  });

  it('should reject invalid grade', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Male',
      grade: '13th', // Invalid grade
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid grade value');
  });

  it('should reject too many academic interests', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: Array(15).fill('Interest'), // Too many interests
      location: 'New York, NY',
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('You can select up to 10 academic interests');
  });

  it('should reject empty academic interests', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: [''], // Empty interest
      location: 'New York, NY',
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Academic interests must be non-empty strings');
  });

  it('should reject location that is too long', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'A'.repeat(150), // Too long
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Location must be less than 100 characters');
  });

  it('should reject invalid avatar URL', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
      avatar: 'invalid-url', // Invalid URL
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Avatar must be a valid image URL');
  });

  it('should accept valid avatar URL', () => {
    const validProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
      avatar: 'https://example.com/avatar.jpg', // Valid URL
    };

    const result = validateUserProfile(validProfile);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid privacy settings', () => {
    const invalidProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
      privacySettings: {
        profileVisibility: 'invalid', // Invalid value
        showEmail: 'not-a-boolean', // Invalid type
      },
    };

    const result = validateUserProfile(invalidProfile);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid profile visibility setting');
    expect(result.errors).toContain('Show email must be a boolean value');
  });

  it('should accept valid privacy settings', () => {
    const validProfile = {
      age: 16,
      gender: 'Male',
      grade: '10th',
      academicInterests: ['Math', 'Science'],
      location: 'New York, NY',
      privacySettings: {
        profileVisibility: 'public',
        showEmail: true,
        showLocation: false,
        showAcademicInfo: true,
      },
    };

    const result = validateUserProfile(validProfile);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});