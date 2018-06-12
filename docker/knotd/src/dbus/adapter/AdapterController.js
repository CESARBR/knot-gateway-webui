import { Subject } from 'rxjs';

class AdapterController {
  constructor(sendPresenceInteractor, turnOffInteractor) {
    this.sendPresenceInteractor = sendPresenceInteractor;
    this.turnOffInteractor = turnOffInteractor;
    this.deviceAddedSource = new Subject();
    this.deviceRemovedSource = new Subject();
  }

  get deviceAdded$() {
    return this.deviceAddedSource.asObservable();
  }

  get deviceRemoved$() {
    return this.deviceRemovedSource.asObservable();
  }

  async sendPresence(id, name) {
    const device = await this.sendPresenceInteractor.execute(id, name);
    this.deviceAddedSource.next(device);
  }

  async turnOff(id) {
    const removed = await this.turnOffInteractor.execute(id);
    if (removed) {
      this.deviceRemovedSource.next(id);
    }
  }
}

export default AdapterController;
