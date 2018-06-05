class NotFoundError extends Error {
  constructor(message, id) {
    super(message);
    this.name = 'NotFoundError';
    this.id = id;
  }
}

export default NotFoundError;
