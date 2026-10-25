# Gaming Record System

## 1. Project Overview
The Gaming Record System is a full-stack web application for managing player records and game information. It provides a dashboard through which users can create, view, update, search, filter, and delete records. The application uses React for the frontend, Node.js and Express.js for the backend, and MongoDB for data storage.

## 2. Objectives
* Develop a web-based system for managing gaming records.
* Implement CRUD (Create, Read, Update, Delete) operations for players and games.
* Provide search and filtering functionality.
* Validate user input and display understandable error messages.
* Store records persistently in MongoDB.
* Deploy the application online for demonstration.

## 3. Features
* Dashboard displaying player and game records.
* Add, edit, and delete player records.
* Add, edit, and delete game records.
* Search and filter records.
* Form validation and error handling.
* Responsive interface for desktop and mobile devices.
* REST API for communication between the frontend and backend.
* Persistent database storage using MongoDB Atlas.

## 4. Technology Stack

| Component | Technology |
| :--- | :--- |
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| API testing | Node.js built-in test runner |
| Version control | Git and GitHub |
| Deployment | Render |

## 5. System Architecture
The application follows a client-server architecture.

1. **Frontend:** React provides the dashboard, forms, search, and record management interface.
2. **Backend:** Express.js exposes REST API endpoints and handles requests and validation.
3. **Database:** MongoDB stores player and game records, accessed through Mongoose.
4. **Communication:** The frontend sends HTTP requests to the backend, which reads or modifies records in the database and returns responses.

## 6. Database Models

### Players
Player records contain the following fields:
* `"username"`: Player username.
* `"game"`: Name of the associated game.
* `"level"`: Player level.

### Game
Game records contain the following fields:
* `"name"`: Name of the game.
* `"genre"`: Game genre.

MongoDB also generates a unique document identifier for each record.

## 7. Project Structure
```text
gaming-record-system/
├── gaming-frontend/
│   └── src/
├── models/
│   ├── Game.js
│   └── Players.js
├── tests/
│   └── api.test.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── Readme.md
└── server.js
```

## 8. Installation and Execution

### Prerequisites
* Node.js and npm
* MongoDB local installation or a MongoDB Atlas database
* Git (optional, for cloning the repository)

### Setup
1. Clone the repository or open the project folder.
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd gaming-frontend
   npm install
   ```
4. Create a `.env` file in the project root using `.env.example` as a reference.
5. Configure `MONGODB_URI`, `PORT`, and `FRONTEND_URL` appropriately.
6. Ensure the configured MongoDB database is accessible.

### Run the Backend
From the project root:
```bash
npm run dev
```

### Run the Frontend
Open another terminal:
```bash
cd gaming-frontend
npm run dev
```

### Run Automated Tests
Ensure the backend and database are running, then execute from the project root:
```bash
npm test
```
The automated test suite checks API health, record retrieval, input validation, malformed IDs, and CRUD operations.

## 9. API Endpoints

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| GET | `/api/health` | Check server and database health |
| GET | `/api/status` | Retrieve application status |
| GET | `/api/players` | Retrieve player records |
| POST | `/api/players` | Create a player |
| PUT | `/api/players/:id` | Update a player |
| DELETE | `/api/players/:id` | Delete a player |
| GET | `/api/games` | Retrieve game records |
| POST | `/api/games` | Create a game |
| PUT | `/api/games/:id` | Update a game |
| DELETE | `/api/games/:id` | Delete a game |

## 10. Testing
The project uses the Node.js built-in test runner. The current API test suite contains seven tests covering health checks, record retrieval, invalid inputs, malformed IDs, and player and game CRUD operations.

## 11. Version Control
Git and GitHub are used to manage project changes.
* The `main` branch contains the integrated project.
* Feature branches can be used to develop changes separately.
* Changes are committed locally and pushed to GitHub.
* The repository can be cloned onto another computer.

## 12. Deployment
The frontend and backend are deployed on Render, and MongoDB Atlas provides cloud database storage. The public frontend and backend URLs can be added here:
* Frontend URL: Add your deployed frontend URL.
* Backend URL: Add your deployed backend URL.

## 13. Conclusion
The Gaming Record System demonstrates full-stack web development through a React interface, REST API integration, MongoDB data persistence, input validation, automated testing, and cloud deployment. It provides a practical example of managing gaming records through a web application.
