// Simple global store for robot state
class RobotsStore {
  constructor() {
    this.listeners = [];
    this.robots = [
      {
        id: 1,
        name: 'Isar-Doggo 1',
        position: [11.559542, 48.109593], // Lng, Lat order for MapLibre usually, but store seems to use Lat, Lng based on previous file. Wait, MapLibre uses [Lng, Lat]. The previous file had [48.12552, 11.58397] which is [Lat, Lng]. Let's check MapView.jsx usage.
        // In MapView.jsx: .setLngLat([item.longitude, item.latitude]) -> [Lng, Lat]
        // In robotSimulation.js: const [lat1, lng1] = pos1; -> Store uses [Lat, Lng]
        // So I should use [48.109593, 11.559542]
        battery: 85,
        status: 'moving',
        targetHotspotIndex: 0,
        trashCollected: 12.5,
      },
      {
        id: 2,
        name: 'Isar-Doggo 2',
        position: [48.109650, 11.559600],
        battery: 92,
        status: 'collecting',
        targetHotspotIndex: 1,
        trashCollected: 8.2,
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
