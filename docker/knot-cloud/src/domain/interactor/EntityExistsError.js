class EntityExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EntityExistsError';
  }
}

export default EntityExistsError;
