# ReactXR Test 2

A web-based interactive platform for visualizing sorting algorithms, featuring Augmented Reality (AR) and 3D elements. Built with React and Vite, this project includes both a frontend for users to interact with sorting exercises and a backend for managing exercise data.

**Live Demo:** [https://reactxr-test2.vercel.app/](https://reactxr-test2.vercel.app/)

---

## Features

- **Sorting Visualization:** Step-by-step, interactive demonstration of sorting algorithms (e.g., insertion sort) using 3D spheres and compartments.
- **Augmented Reality (AR):** Enter AR mode to manipulate and view sorting steps in an immersive environment.
- **Exercise Mode:** Solve randomized sorting tasks and receive feedback on correctness.
- **AI Assistance:** Integrates Google Gemini API to provide real-time, context-aware hints and suggestions for the next sorting step.
- **Authoring Tools:** 3D authoring panel to create, edit, and manage custom sorting exercises.
- **Backend API:** Express/MongoDB backend with RESTful endpoints to store and retrieve exercises.

## Project Structure

```
.
├── src/
│   ├── App.jsx                  # Main React app logic and AR entry
│   └── components/
│         ├── DemoSortVisualizer.jsx     # 3D sorting demo (step-by-step)
│         ├── ExerciseSortVisualizer.jsx # Interactive exercise mode
│         ├── AuthoringPanel3D.jsx      # 3D exercise authoring panel
│         ├── gemini.js                 # Google Gemini API integration
│         └── helpers.js                # Array/sorting helpers and API calls
├── server/
│     └── server.js              # Express/MongoDB backend server
├── public/                      # Static assets
├── index.html                   # App HTML entrypoint
├── vite.config.js               # Vite configuration (with API proxy)
└── README.md                    # Project documentation
```

## Getting Started

### Prerequisites

- Node.js and npm
- (Optional) MongoDB (for backend exercise storage)
- Google Gemini API key (for AI hints)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/minhpham1810/reactxr_test2.git
   cd reactxr_test2
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment:**
   - Create a `.env` file for both frontend (VITE_API_BASE) and backend (MONGO_URI, etc.) as needed.
   - Set your Gemini API key in the appropriate place.

4. **Run the backend:**
   ```sh
   cd server
   npm install
   node server.js
   ```

5. **Run the frontend:**
   ```sh
   npm run dev
   ```

6. **Access the app:**
   Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

- `GET /api/exercises` – List all exercises
- `POST /api/exercises` – Create a new exercise
- `GET /api/exercises/:id` – Retrieve a specific exercise
- `PUT /api/exercises/:id` – Update an exercise
- `DELETE /api/exercises/:id` – Delete an exercise

## Technologies Used

- React, Vite, Three.js (for 3D), React Three Fiber
- Express.js, MongoDB (backend)
- Google Gemini API (AI suggestions)

## License

This project is for educational and demonstration purposes.

---
**Author:** [@minhpham1810](https://github.com/minhpham1810)
