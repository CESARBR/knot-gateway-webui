class InvalidTokenTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidTokenTypeError';
  }
}

export default InvalidTokenTypeError;
