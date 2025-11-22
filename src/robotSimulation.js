import { robotsStore } from './robotsStore';

// Mock trash hotspots around the Isar
export const trashHotspots = [
  { id: 1, position: [48.12520, 11.58350], radius: 30 },
  { id: 2, position: [48.12590, 11.58420], radius: 25 },
  { id: 3, position: [48.12480, 11.58450], radius: 35 },
  { id: 4, position: [48.12610, 11.58320], radius: 28 },
  { id: 5, position: [48.12550, 11.58480], radius: 32 },
];

// Calculate distance between two lat/lng points (simplified)
function calculateDistance(pos1, pos2) {
  const lat1 = pos1[0];
  const lng1 = pos1[1];
  const lat2 = pos2[0];
  const lng2 = pos2[1];
  
  const latDiff = lat2 - lat1;
  const lngDiff = lng2 - lng1;
  
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

// Move position toward target
function moveToward(current, target, step) {
  const [currentLat, currentLng] = current;
  const [targetLat, targetLng] = target;
  
  const latDiff = targetLat - currentLat;
  const lngDiff = targetLng - currentLng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  
  if (distance < step) {
    return target;
  }
  
  const ratio = step / distance;
  return [
    currentLat + latDiff * ratio,
    currentLng + lngDiff * ratio,
  ];
}

// Statuses rotation logic
const statusCycle = ['moving', 'collecting', 'moving'];
let statusChangeCounter = 0;

// Simulation tick (called every 300ms)
export function simulateRobotMovement() {
  const robots = robotsStore.getRobots();
  const updates = [];
  
  statusChangeCounter++;
  
  robots.forEach((robot) => {
    const targetHotspot = trashHotspots[robot.targetHotspotIndex];
    const targetPosition = targetHotspot.position;
    const distance = calculateDistance(robot.position, targetPosition);
    
    // Check if robot reached the hotspot
    if (distance < 0.0001) {
      // Robot reached hotspot - pick next one
      const nextIndex = (robot.targetHotspotIndex + 1) % trashHotspots.length;
      const newStatus = statusChangeCounter % 20 === 0 ? 'collecting' : 'moving';
      
      updates.push({
        id: robot.id,
        updates: {
          targetHotspotIndex: nextIndex,
          status: newStatus,
          battery: Math.max(10, robot.battery - 0.3),
        },
      });
    } else {
      // Move toward target
      const newPosition = moveToward(robot.position, targetPosition, 0.00015);
      const newBattery = Math.max(10, robot.battery - 0.1);
      
      // Occasionally change status
      let newStatus = robot.status;
      if (statusChangeCounter % 15 === 0 && robot.status === 'moving') {
        newStatus = 'collecting';
      } else if (statusChangeCounter % 15 === 5 && robot.status === 'collecting') {
        newStatus = 'moving';
      }
      
      // Simulate charging when battery is low
      if (newBattery < 20) {
        newStatus = 'charging';
      }
      
      updates.push({
        id: robot.id,
        updates: {
          position: newPosition,
          battery: newBattery,
          status: newStatus,
        },
      });
    }
  });
  
  robotsStore.updateAllRobots(updates);
}

// Start the simulation
let simulationInterval = null;

export function startSimulation() {
  if (simulationInterval) return;
  
  simulationInterval = setInterval(() => {
    simulateRobotMovement();
  }, 300);
}

export function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}
