# ClassTracker


# Timetable Management System

A React-based timetable management system that allows users to view, edit, and track their weekly schedules. It integrates with Firebase to store user-specific schedule data and dynamically manage courses.

## Features

- **Dynamic Timetable**: View a weekly timetable with course assignments for each day and time slot.
- **Editable Mode**: Toggle between view and edit mode, allowing users to modify their timetable.
- **Course Management**: Add new courses and select existing courses for each time slot.
- **Real-Time Updates**: All changes are saved in Firebase and reflected in real-time across devices.
- **Firebase Integration**: Store schedules and course data in Firebase Realtime Database.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shashankiitbhu/ClassTracker.git
   cd ClassTracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Setup

1. **Firebase Setup**: To integrate Firebase, you’ll need to set up a Firebase project and get your Firebase configuration.

   - Go to [Firebase Console](https://console.firebase.google.com/), create a new project, and add Firebase to your web app.
   - Copy your Firebase config and replace the existing configuration in `src/firebase.js`.

2. **Authentication**: Set up Firebase authentication (email/password or other methods) for users to log in.

   ```js
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   ```

3. **Firebase Database**: Ensure that your Firebase Realtime Database is set up with read and write rules. Example rules:

   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
   ```

4. Create the Firebase configuration file (`src/firebase.js`):

   ```js
   import { initializeApp } from 'firebase/app';
   import { getDatabase } from 'firebase/database';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     databaseURL: "your-database-url",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };

   const app = initializeApp(firebaseConfig);
   const db = getDatabase(app);

   export { db };
   ```

## Usage

1. **Run the project**:

   ```bash
   npm start
   ```

2. **App Features**:

   - **Edit Mode**: Toggle the edit mode using the button in the header to start editing the timetable.
   - **Course Management**: When in edit mode, you can:
     - Select an existing course from a dropdown for a specific time slot.
     - Add a new course to the dropdown, which will be saved in Firebase.
   - **Saving Changes**: All changes are saved in Firebase, and the timetable is updated in real time.

3. **Week Navigation**: Use the "Previous Week" and "Next Week" buttons to view and manage schedules for different weeks.

## Technologies Used

- **React**: For building the user interface.
- **Firebase**: For user authentication and storing timetable data in Firebase Realtime Database.
- **JavaScript (ES6+)**: For modern JavaScript features like async/await, destructuring, etc.
- **Tailwind CSS**: For styling the components.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
