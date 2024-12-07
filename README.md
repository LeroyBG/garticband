# GarticBand

![Svelte](https://img.shields.io/badge/svelte-%23f1413d.svg?style=for-the-badge&logo=svelte&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NodeJS](https://camo.githubusercontent.com/8477a50d7210f0f3bf15fbe5b44809296b75f2101a2927818599d72c8ea72cef/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6e6f64652e6a732d3644413535463f7374796c653d666f722d7468652d6261646765266c6f676f3d6e6f64652e6a73266c6f676f436f6c6f723d7768697465) ![Socket.io](https://camo.githubusercontent.com/e3aef779877ecfad97fc1e213d3c449a685e6766c0c7fdca210802d4a1f59302/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f536f636b65742e696f2d626c61636b3f7374796c653d666f722d7468652d6261646765266c6f676f3d736f636b65742e696f266261646765436f6c6f723d303130313031) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

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

## License

This project is under the [Apache License](./LICENSE).
