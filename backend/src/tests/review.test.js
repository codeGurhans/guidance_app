const Review = require('../models/Review');
const College = require('../models/College');

describe('Review Model', () => {
  it('should be defined', () => {
    expect(Review).toBeDefined();
  });
});