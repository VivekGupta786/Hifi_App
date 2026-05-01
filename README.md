# HiFi — Real-Time Chat Application

HiFi is a full-stack real-time chat application built with the MERN stack. It features a friend request system, real-time messaging, group chats, and notifications.

## Tech Stack

**Client:** React JS, Chakra UI, Socket.io-client

**Server:** Node JS, Express JS, Socket.io

**Database:** MongoDB Atlas

## Features

- User authentication (JWT)
- Friend request system (send, accept, reject)
- Real-time one-on-one and group messaging
- Typing indicators
- Message and friend activity notifications
- Clear chat history
- Unfriend users
- Group chat creation and management
- Profile viewing

## Run Locally

Clone the project

```bash
git clone https://github.com/VivekGupta786/Hifi.git
cd Hifi
```

Install dependencies

```bash
npm install
cd frontend
npm install --legacy-peer-deps
```

Create a `.env` file in the root with:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the backend

```bash
npm run server
```

Start the frontend

```bash
cd frontend
npm start
```

## Made By

- [@VivekGupta786](https://github.com/VivekGupta786)
