ConvoSpace

A full-stack collaboration platform for video calls, file sharing, shared notes, and AI-powered insights

🚀 Why this exists

During my hackathon and project-prep phase (especially as I build up my full-stack + realtime + AI skills), I wanted a standalone, deployable demo that:

enables teams to meet and collaborate live via video calls

supports file sharing + shared notes in realtime

integrates AI (via OpenAI API / Gemini API) for on-the-fly insights during discussions

is built end-to-end (frontend + backend + realtime) and deployable on a free tier

So this repo is the result—something I can demo, share on my resume/LinkedIn, and talk through during interviews.

🎯 Features

MERN stack: MongoDB, Express, React, Node.js

Realtime group video calls via WebRTC

Chat & file transfer using Socket.io

Shared notepad/meeting minutes app inside the same session

AI‐powered question answering/discussion insights (via OpenAI/Gemini)

Deployable on free platforms (e.g., Vercel for frontend, free tier for backend)

🧰 Tech Stack

Frontend: React (with hooks/context)

Backend/API: Node.js + Express

Database: MongoDB (with Mongoose)

Realtime: WebRTC & Socket.io

AI Service: OpenAI API / Gemini API

Hosting: Free-tier friendly

📥 Getting Started
Prerequisites

Node.js (v16+) & npm/yarn/pnpm

MongoDB instance (local or cloud)

API key for OpenAI or Gemini if you’re doing the AI part

Setup
git clone https://github.com/akshatx03x/ConvoSpace.git
cd ConvoSpace
npm install            # or yarn / pnpm

Configure environment

Create a .env file in the root with values like:

MONGO_URI        = <your-mongodb-connection-string>
OPENAI_API_KEY   = <your-openai/gemini-api-key>

Run locally
npm run dev       # or yarn dev


Open http://localhost:3000
 in your browser for frontend. Make sure your backend is running too.

Build & deploy
npm run build
npm start


You can deploy backend on Heroku/AWS/GCP free-tier, frontend on Vercel/Netlify, etc.

🧩 Project Structure

A quick overview:

/frontend             – React app (UI, video-call, chat, notes)  
/backend              – Express API (auth, session handling, AI requests, file upload)  
/models               – MongoDB models  
/routes               – API routes  
/controllers          – Business logic  
/utils                – Shared utilities (e.g., wiring Socket.io, WebRTC helpers)  
/public               – Static assets  

✅ Why this stands out

You’re showcasing frontend + backend + realtime + AI in one project

Real-world collaboration features (video, chat, notes) make it interactive—great talking point in interviews

Built with free-deploy platforms in mind—no paid dependencies required

Shows you as a full-stack engineer comfortable with modern stacks and integration

📌 Roadmap (What’s next)

Add user authentication & roles (e.g., host/moderator vs participant)

Add breakout rooms for video calls

Improve UI/UX (dark mode, mobile responsiveness)

Add analytics/dashboard for session usage

Add tests & CI/CD for production-readiness

💡 How to talk about this in an interview

Start with the problem: teams need an easy way to collaborate with video, files, notes + get insights

Highlight architecture: MERN stack, WebRTC/Socket.io for realtime, AI integration

Show demo flow: user joins session → video call starts → files shared → notes live updated → AI answers a discussion question

Talk about challenges you solved: e.g., syncing notes, balancing video stream + chat + file transfer, integrating AI requests

Mention deployment: how you built it to run on free tier, scalability considerations

🤝 Contribute

Contributions, issues and feature-requests are welcome!
If you want to add something:

Fork the repo

Create your feature branch (feature/… or fix/…)

Commit your changes

Send a pull request with a clear description of what you’ve done

📄 License

This project is licensed under the MIT License — feel free to use it, adapt it, extend it.

Thanks for checking it out!
If you like this project, give it a ⭐ on GitHub & feel free to reach out if you want to collaborate or improve it.

Happy coding! 🎉
