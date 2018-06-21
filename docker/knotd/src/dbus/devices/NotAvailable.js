class NotAvailable extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotAvailable';
  }
}

export default NotAvailable;
