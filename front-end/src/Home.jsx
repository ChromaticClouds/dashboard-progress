import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Title from "./Title";
import Weather from "./Weather"
import Weather2 from "./Weather2"
import Summary from './Summary';

const Home = () => {
    return (
        <div>
            <Routes>
                <Route path="/main" element={<Title />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/weather2" element={<Weather2 />} />
            </Routes>
        </div>
    );
}

export default Home;
