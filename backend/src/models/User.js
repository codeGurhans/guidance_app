const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  // Extended user profile fields
  age: {
    type: Number,
    min: 10,
    max: 100,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  grade: {
    type: String,
    enum: ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Graduate', 'Other'],
  },
  academicInterests: [{
    type: String,
    trim: true,
  }],
  location: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    trim: true,
  },
  // Privacy settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'private',
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showLocation: {
      type: Boolean,
      default: false,
    },
    showAcademicInfo: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Remove password from responses
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;