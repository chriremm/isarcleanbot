# Isar CleanBot 🤖♻️

An interactive dashboard simulating autonomous trash-collecting robots along the Isar river in Munich.

This project visualizes public trash cans and simulates a fleet of "Isar-Doggo" robots that autonomously visit hotspots to keep the environment clean.

## 🌟 Features

*   **Robot Simulation**:
    *   Real-time tracking of autonomous cleaning robots.
    *   Simulation of movement, trash collection, and battery consumption.
    *   Live status display (battery, collected trash, status) by clicking on a robot.
*   **Interactive Map**:
    *   Detailed map based on MapLibre GL JS.
    *   Display of all public trash cans along the Isar (Data source: Open Data Munich).
*   **Heatmap Visualization**:
    *   Visualization of trash hotspots.
    *   Continuously adjustable heatmap opacity via a slider.
*   **Modern UI**:
    *   Glassmorphism design for controls and popups.
    *   Animated markers and smooth transitions.
*   **AI Trash Detection (Experimental)**:
    *   Python module for identifying trash in images using the SAM3 model.

## 🛠️ Technologies

*   **Frontend**: React, Vite
*   **Mapping**: MapLibre GL JS
*   **Styling**: CSS3 (Custom Animations, Glassmorphism)
*   **Data**: CSV Parsing for trash can locations

## 🚀 Installation & Start

1.  Clone repository:
    ```bash
    git clone https://github.com/chriremm/isarcleanbot.git
    cd isar-cleanbot
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 📂 Project Structure

*   `src/MapView.jsx`: Main component for map and rendering.
*   `src/robotSimulation.js`: Logic for autonomous robot movement.
*   `src/robotsStore.js`: State management for the robot fleet.
*   `prediction/`: Python scripts for AI-based trash detection (SAM3).
*   `public/`: Static assets (CSV data, images).

---
*Developed as a prototype for a clean Isar.*
