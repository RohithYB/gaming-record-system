Step-1. Create directory

mkdir gaming-record-system
cd gaming-record-system

step-2. install libraries and dependencies

npm init -y
npm install express mongoose
pip install cros

step-3 structure the directories, folders, files, codes, ..etc

gaming-frontend
models
database

Development Status

- Backend: Express.js and Node.js
- Database: MongoDB with Mongoose
- Frontend: React and Vite
- API tests: Node.js built-in test runner
- Version control: Git

Running the Project

1. Configure the environment variables in ".env".
2. Start the local MongoDB service.
3. Start the backend using "npm run dev".
4. Start the frontend in a separate terminal using "npm run dev" from the "gaming-frontend" directory.
5. Run the backend API tests using "npm test" while the backend and MongoDB are running.