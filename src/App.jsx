import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import store from './store'; // Import your configured Redux store
import { getToken } from './features/tokenUtils.js'; // Import getToken function

function App() {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);

  //see if user is logged in function
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {

        console.log("User logged in."); 
    } else {
        console.log("No user logged in.");
    }
}, []);



  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
