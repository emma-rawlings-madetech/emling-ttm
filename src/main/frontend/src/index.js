import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <head lang="en">
        <meta charset="UTF-8"/>
        <title>ReactJS + Spring Data REST</title>
        <link rel="stylesheet" href="/main.css" />
    </head>
    <body>
        {/*TODO i'd rather this thymeleaf template code be ported to react
        <div>
            Hello, <span id="username" th:text="${#authentication.name}">user</span>.
            <form th:action="@{/logout}" method="post">
                <input type="submit" value="Log Out"/>
            </form>
        </div>*/}
        {/*<BrowserRouter>*/}
            <App loggedInManager="greg"/>
        {/*</BrowserRouter>*/}
    </body>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();