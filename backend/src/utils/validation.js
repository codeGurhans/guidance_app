/**
 * Validate user profile data
 * @param {object} userData - User data to validate
 * @returns {object} - Validation result with isValid flag and errors array
 */
const validateUserProfile = (userData) => {
  const errors = [];
  
  // Validate age
  if (userData.age !== undefined) {
    if (isNaN(userData.age) || userData.age < 10 || userData.age > 100) {
      errors.push('Age must be a number between 10 and 100');
    }
  }
  
  // Validate gender
  if (userData.gender !== undefined) {
    const validGenders = ['Male', 'Female', 'Other', 'Prefer not to say'];
    if (!validGenders.includes(userData.gender)) {
      errors.push('Invalid gender value');
    }
  }
  
  // Validate grade
  if (userData.grade !== undefined) {
    const validGrades = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Graduate', 'Other'];
    if (!validGrades.includes(userData.grade)) {
      errors.push('Invalid grade value');
    }
  }
  
  // Validate academic interests
  if (userData.academicInterests !== undefined) {
    if (!Array.isArray(userData.academicInterests)) {
      errors.push('Academic interests must be an array');
    } else if (userData.academicInterests.length > 10) {
      errors.push('You can select up to 10 academic interests');
    } else {
      for (const interest of userData.academicInterests) {
        if (typeof interest !== 'string' || interest.trim().length === 0) {
          errors.push('Academic interests must be non-empty strings');
          break;
        }
      }
    }
  }
  
  // Validate location
  if (userData.location !== undefined) {
    if (typeof userData.location !== 'string' || userData.location.trim().length === 0) {
      errors.push('Location is required');
    } else if (userData.location.trim().length > 100) {
      errors.push('Location must be less than 100 characters');
    }
  }
  
  // Validate avatar URL
  if (userData.avatar !== undefined) {
    if (typeof userData.avatar !== 'string' || userData.avatar.trim().length === 0) {
      errors.push('Avatar URL is required');
    } else if (userData.avatar.trim().length > 500) {
      errors.push('Avatar URL must be less than 500 characters');
    } else if (!userData.avatar.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i)) {
      errors.push('Avatar must be a valid image URL');
    }
  }
  
  // Validate privacy settings
  if (userData.privacySettings !== undefined) {
    const { profileVisibility, showEmail, showLocation, showAcademicInfo } = userData.privacySettings;
    
    if (profileVisibility !== undefined && !['public', 'private', 'friends'].includes(profileVisibility)) {
      errors.push('Invalid profile visibility setting');
    }
    
    if (showEmail !== undefined && typeof showEmail !== 'boolean') {
      errors.push('Show email must be a boolean value');
    }
    
    if (showLocation !== undefined && typeof showLocation !== 'boolean') {
      errors.push('Show location must be a boolean value');
    }
    
    if (showAcademicInfo !== undefined && typeof showAcademicInfo !== 'boolean') {
      errors.push('Show academic info must be a boolean value');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUserProfile
};