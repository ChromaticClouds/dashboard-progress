import React from 'react';
import { Routes, Route, ScrollRestoration } from 'react-router-dom';
import Title from "./Title";

const Home = () => {
    return (
        <div>
            <Routes>
                <Route path="/main" element={<Title />} />
            </Routes>
        </div>
    );
}

export default Home;
