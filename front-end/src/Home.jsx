import React from 'react';
import { Routes, Route, ScrollRestoration } from 'react-router-dom';
import Title from "./Title";
import Calender from './Calendar/Calendar';

const Home = () => {
    return (
        <div>
            <Routes>
                <Route path="/main" element={<Title />} />
                <Route path="/calender" element={<Calender />} />
            </Routes>
        </div>
    );
}

export default Home;
