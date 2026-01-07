import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";

export const LoadingSpinner = () => (
  <>
    <style>
      {`
        body {
            background-color: #e2e2dc;
            padding: 0;
            margin: 0;
        }
        .spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .spinner-border {
            width: 3rem;
            height: 3rem;
            border: 0.3em solid rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spinner-border 0.75s linear infinite;
        }
        @keyframes spinner-border {
            to { transform: rotate(360deg); }
        }
      `}
    </style>

    <div className="spinner">
      <div className="spinner-border"></div>
    </div>
  </>
);

export const LazyTitle = React.lazy(
  () => import("./components/dashboard/main-page")
);

export const App = (): JSX.Element => {
  return (
    <div>
      <Routes>
        <Route
          path="/main"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyTitle />
            </Suspense>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};
