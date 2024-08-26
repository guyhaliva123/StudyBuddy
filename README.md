## StudyBuddy : 

StudyBuddy is an AI-driven application designed to help users schedule and manage their study sessions effectively. The project utilizes advanced algorithms to provide personalized study plans and tips to optimize learning.

Features

AI-Powered Scheduling: Generates personalized study schedules based on user input.
Study Reminders: Sends reminders to keep you on track with your study plan.
Progress Tracking: Monitors your study progress and adjusts the schedule as needed.
Technology Stack

Backend: Python,Flask
Frontend: HTML, CSS, JavaScript, React
Machine Learning: OpenAi
Database: FireBase



## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm install react-calendar`

### `npm install react-big-calendar`

### 'npm install @canvasjs/react-charts --save'

### 'npm install react-multi-carousel --save'

### 'pip install Flask'

### 'pip install setuptools'

### 'pip install pyrebase4'

### 'pip install flask_cors'

### 'pip install firebase-admin'

if you want to run the flask app with docker Container follow this steps:
1.download the docker desktop app from here: https://www.docker.com/products/docker-desktop/
2.write this commands in the terminal:

    - 'pwd' : to make sure you are on the right directory you need to be on Desktop/Project-StutyBuddy/BS-PMC-2024-Team15

    - mac:'source venv/Scripts/activate',windows:'venv\Scripts\activate' : used to activate a virtual environment in Python. A virtual environment is an isolated environment that allows you to manage dependencies for different projects separately.

    - go to app.py and change the cred to the path above . you want the path to the Backend directory and the json inside the Backend directory.-m

    - 'cd Backend' : you want to be in the same directory as the docker file.

    - 'docker build -t flask-api /Users/guy/Desktop/Project-StutyBuddy/BS-PMC-2024-Team15/Backend' : make sure to change the path in this line to the path in your computer you want the path for the Backend directory which the Dockerfile in it. this command will build the image for you in the docker desktop.

    - 'docker run -dp 5000:5000 -w /Backend -v "$(pwd)/Backend:/Backend" -e FLASK_ENV=development flask-api' : this command will run the Docker image inside a Container in the docker app on the desktop. this command making sure that every time we change somthing on the code the image refresh so it will run the latest version of the code.

if you want to test the flask server from the terminal use this command :
' curl -X POST http://localhost:5000/login -d '{"username":"your user name from DB","password":"your password"}' -H "Content-Type: application/json" '
this will test the login route with the data above.

if you want to run tests follow this steps:

    - 'cd Backend'

? - mac:'source venv/Scripts/activate',windows:'venv\Scripts\activate' : used to activate a virtual environment in Python. A virtual environment is an isolated environment that allows you to manage dependencies for different projects separately. ?

- 'pip install -r requirements.txt' : to make sure you have all the packges you need for the tests.

- 'pytest'

if you having issues in the register test make sure the the user name provided in the test is not already in the db.

To use Tab features in Statistics, you need to run the next line:

- npm install react-tabs
