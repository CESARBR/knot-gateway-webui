class NotPaired extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotPaired';
  }
}

export default NotPaired;
