// Simple global store for robot state
class RobotsStore {
  constructor() {
    this.listeners = [];
    this.robots = [
      {
        id: 1,
        name: 'CleanBot Alpha',
        position: [48.12552, 11.58397],
        battery: 95,
        status: 'moving',
        targetHotspotIndex: 0,
      },
      {
        id: 2,
        name: 'CleanBot Beta',
        position: [48.12612, 11.58457],
        battery: 87,
        status: 'moving',
        targetHotspotIndex: 1,
      },
    ];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.robots));
  }

  getRobots() {
    return this.robots;
  }

  updateRobot(id, updates) {
    const robotIndex = this.robots.findIndex((r) => r.id === id);
    if (robotIndex !== -1) {
      this.robots[robotIndex] = { ...this.robots[robotIndex], ...updates };
      this.notify();
    }
  }

  updateAllRobots(updatesArray) {
    updatesArray.forEach(({ id, updates }) => {
      const robotIndex = this.robots.findIndex((r) => r.id === id);
      if (robotIndex !== -1) {
        this.robots[robotIndex] = { ...this.robots[robotIndex], ...updates };
      }
    });
    this.notify();
  }
}

export const robotsStore = new RobotsStore();
