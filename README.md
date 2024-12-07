# GarticBand
GarticBand is a realtime web game application that allows multiple users to play on a music board and compose a musical piece together, fostering a truly collective experience.

## Why GarticBand
The age of the internet ushered in a new era of social interaction shaped by increased connectivity, but has left many of us feeling more disconnected than ever. Because of this, we wanted to make a project that harnessed the internet’s power to bring us together in a way reminiscent of the internet of the past. We were inspired by small scale real-time multiplayer web games like one million checkboxes, which lets users check a wall of… one million checkboxes, but in real time, as well as online beat makers like Roland50.studio, to create an accessible, collaborative music game in which players can easily make music by just clicking on a sequencer board.

## Installation and deploying locally
To start hosting our app locally, use the following command in your desired location:

```zsh
git clone https://github.com/LeroyBG/garticband.git
```

Open your terminal and change your directory into the top level folder of the application. Make sure you have Node.js and npm installed. You will need to install the necessary libraries and dependencies for both the backend and frontend of the application. From the top level folder, cd into both the backend and frontend folders with the following commands:

```zsh
cd ./frontend/garticband
cd ./backend
```

Once inside the folders, run the following command:

```zsh
npm install
```

## Running

Both the frontend and backend require environment variables, which can be seen
in `frontend/garticband/.env.example` and `backend/garticband/.env.example`,
respectively. Create .env files in both directories, and replace the
values of the environment variables from the example files. All that remains now is to run the web app

### Frontend

The frontend is a SvelteKit app, which requires Node to run. Run the following commands from the top level folder:

```zsh
cd ./frontend/garticband
npm i
npm run dev
```

### Backend

The backend is a JavaScript server developed in the Node runtime. Run the following commands from the top level folder:

```zsh
cd backend
npm i
npm run dev
```

This will open the GarticBand landing page in your browser on port 3000 and http://localhost:5173/. 
