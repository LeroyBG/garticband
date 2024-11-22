# Garticband

## Running

Both the frontend and backend require environment variables, which can be seen
in `frontend/garticband/.env.example` and `backend/garticband/.env.example`,
respectively. Create .env files in both directories, and replace the
values of the environment variables from the example files.

### Frontend

The frontend is a SvelteKit app, which requires Node to run.

```zsh
cd ./frontend/garticband
npm i
npm run dev
```

### Backend

The backend is a JavaScript server developed in the Node runtime.

```zsh
cd backend
npm i
npm run dev
```