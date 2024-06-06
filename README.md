# BugTracker

## Overview

BugTracker is a comprehensive bug tracking and project management tool designed to facilitate team collaboration and streamline workflows. It supports real-time updates, allowing users to create teams, manage projects, organize sprints, and communicate effectively.

## Features

- **Team Management**: Create and manage teams with your colleagues or friends.
- **Project Management**: Set up multiple projects within a team, each with its own set of sprints and tasks.
- **Real-Time Updates**: All changes to teams, projects, sprints, and tasks are updated in real-time.
- **Chat Functionality**: Initiate and manage real-time chats with specific team members.
- **User Management**: Users can update their information and manage their profiles.
- **Sprint & Task Management**: Create, update, and track sprints and tasks within each project.
- **Customizable Workflows**: Tailor the project workflow to suit your team's needs.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Firebase Authentication
- **Real-Time Communication**: Firebase Firestore / WebSockets
- **Styling**: CSS, Tailwind CSS
- **Hosting**: Firebase Hosting / Render

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mahfuj10/buggtracker-client-leavesBug-
   ```
2. Navigate to the project directory:
   ```bash
   cd buggtracker-client-leavesBug-
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Set up Firebase for real-time updates and authentication. Follow the Firebase setup guide [here](https://firebase.google.com/docs/web/setup).

5. Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Create an Account**: Sign up using your email or use anonymous sign-in.
2. **Create a Team**: Navigate to the teams section and create a new team.
3. **Add Members**: Invite your friends or colleagues to join your team.
4. **Create Projects**: Within your team, create multiple projects.
5. **Manage Sprints and Tasks**: Organize your projects into sprints and tasks, update their status in real-time.
6. **Chat with Team Members**: Use the chat feature to communicate with specific team members.
7. **Update Information**: Modify team, project, sprint, task, and user information as needed.

## Contact

If you have any questions or suggestions, please open an issue or contact us at mahfujurr042@gmail.com.
