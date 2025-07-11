# ReactXR Test 2 – WebXR Authoring Tool for Computer Science Education

This project aims to address persistent challenges in computer science education by providing a low-cost, accessible WebXR-based authoring tool that enables educators to create interactive, AR-driven learning activities for introductory CS courses (CS1/CS2). The tool is designed to help students visualize and interact with abstract computational concepts, such as data structures and algorithms, in an immersive, engaging environment.

---

## Motivation

Despite a surge in CIS (Computer and Information Science) enrollments and increasing demand for tech professionals, first-year retention rates in CIS programs remain low. Many students struggle with abstract concepts (e.g., data structures, algorithms), which traditional teaching methods and even physical models (like CS Unplugged) often fail to make tangible or flexible enough for effective learning.

**Augmented Reality (AR)** offers a solution: it can provide interactive, immediate, and tangible feedback, making abstract concepts concrete and accessible—especially for students lacking prior computational experience. However, few tools exist for educators (without XR expertise) to author and deploy AR activities in the classroom.

---

## Research Goals

This project is grounded in constructivist learning theory and seeks to answer:

1. **Tool Development:**  
   What design principles enable a WebXR-based authoring tool that is technically robust, user-friendly, and pedagogically effective for CIS educators?
2. **Impact on Learning:**  
   How does tangible interaction in AR environments affect student understanding of abstract CS concepts, compared to physical models or desktop tools?
3. **User Perception:**  
   What are the experiences and challenges of students and educators when using AR tools in classroom settings?

---

## Project Overview

### Phases

- **Tool Development:**  
  Iteratively design and implement the WebXR authoring tool, focusing on usability for educators and support for visualizing fundamental CS topics (e.g., sorting, recursion, linked lists).
- **Testing & Refinement:**  
  Conduct alpha user studies with students and educators, gather feedback, refine the tool, and expand its coverage.
- **Study Preparation:**  
  Prepare and execute formal studies (quantitative and qualitative) to evaluate the tool’s impact on learning outcomes and usability vs. traditional methods.

### Key Features

- **Web-based, Cross-platform:**  
  No installation or specialized hardware required; runs in modern browsers with WebXR support.
- **Intuitive Authoring for Educators:**  
  Drag-and-drop interface for composing AR learning activities—no XR coding experience required.
- **Interactive 3D/AR Visualizations:**  
  Students can manipulate models of algorithms and data structures in both desktop and AR modes.
- **Feedback & Logging:**  
  Real-time feedback and performance data collection for educational research.
- **Customizable Templates:**  
  Quickly adapt activities for different CS concepts and difficulty levels.

---

## Technologies

- **Frontend:**  
  React, Vite, Three.js, React Three Fiber, WebXR
- **Backend:**  
  Node.js, Express.js, MongoDB
- **AI Integration:**  
  Google Gemini API for context-aware hints and scaffolding

---

## Getting Started

### Prerequisites

- Node.js and npm
- (Optional) MongoDB for persistent backend storage
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
   - Add `.env` with relevant variables (API endpoints, Mongo URI, Gemini key, etc.)
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
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Research & Evaluation

- **Iterative development** with feedback from CIS educators and students
- **Mixed methods research:**  
  - Quantitative (pre/post-tests, cognitive load surveys)
  - Qualitative (interviews, classroom observations)
- **Usability and learning impact studies** planned for Fall 2025

---

## Outputs & Dissemination

- **Open-source WebXR authoring tool** for CIS educators
- **Instructional materials** and demonstration videos
- **Research publications & presentations** (SIGCSE, ITiCSE, etc.)
- **Dedicated website** to share the tool, resources, and findings
- **Collaborations** with CS departments and educational technology organizations

---

## License

This project is for educational and research purposes.

---

**Principal Investigator:** [@minhpham1810](https://github.com/minhpham1810)  
**Mentor:** Prof. SingChun

For research updates, demos, and best practices, visit the [project website](https://reactxr-test2.vercel.app/) (coming soon).