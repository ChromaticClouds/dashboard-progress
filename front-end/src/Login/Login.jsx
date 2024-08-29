import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VerEx from 'verbal-expressions';
import axios from 'axios';

import { faXTwitter, faFacebook, faGoogle, faInstagram } from '@fortawesome/free-brands-svg-icons';

import useCookieStore from '../hooks/store/useCookieStore';
import useAuthStore from '../hooks/store/useAuthStore';

import Loading from '../Dashboard/Loading/Loading';

import "./Login.css";

const Login = () => {
    const { setRefreshToken } = useCookieStore();
    const { setUsername, setAccessToken } = useAuthStore();

    const navigate = useNavigate();

    const [isSignin, setIsSignin] = useState(false);

    const [register, setRegister] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [login, setLogin] = useState({
        username: '',
        password: ''
    });

    const usernameRegex = (username) => {
        const errors = [];

        // 조건 1: 허용되지 않은 문자 포함 여부
        const containsInvalidChars = VerEx()
            .startOfLine()
            .word()
            .endOfLine()
            .test(username);

        if (!containsInvalidChars) {
            errors.push("Usernames can only contain letters, numbers, and _.");
        }
      
        // 조건 2-1: 언더바가 앞에 왔는 지 확인
        const startsWithUnderline = VerEx()
            .startOfLine()
            .then('_')
            .test(username);

        if (startsWithUnderline) {
            errors.push("Username cannot start with an underline");
        }

        // 조건 2-2: 언더바가 앞에 왔는 지 확인
        const endsWithUnderline = VerEx()
            .endOfLine()
            .then('_')
            .test(username);

        if (endsWithUnderline) {
            errors.push("Username cannot end with an underline");
        }

        // 조건 2-3: 언더바가 최대 한 번만 오는 지 검사
        const validPattern = VerEx()
            .startOfLine()
            .anythingBut('_')
            .then(
                VerEx()
                    .maybe('_')
            )
            .anythingBut('_')
            .endOfLine()
            .test(username);

        if (!validPattern) {
            errors.push("Username can contain only one underscore");
        }
      
        // 조건 3: 길이가 3자 이상 16자 이하인지 확인
        if (username.length < 3 || username.length > 16) {
            errors.push("Username must be between 3 and 16 characters long.");
        }
      
        // 에러가 없다면 유효성 검사가 통과된 것임
        if (errors.length === 0) {
            return { valid: true, errors: null };
        }
      
        // 에러가 있다면 상세 오류 메시지를 반환
        return { valid: false, errors: errors };
    }

    const duplicateUsernameVerify = async (username) => {
        try {
            const response = await axios.get('http://localhost:3100/api/register', {
                params: { username: username }
            });

            if (response) {
                return null;
            }
        }
        catch (error) {
            return error.response?.data?.message;
        }
    }

    const emailRegex = (email) => {
        const validateEmail = VerEx()
            .startOfLine()
            .anything()
            .then('@')
            .word()
            .then('.')
            .word()
            .endOfLine()
            .test(email)

        if (validateEmail) {
            return { valid: true, error: null }
        }
        else {
            return { valid: false, error: 'Email is not correct type.' }
        }
    }

    const [usernameResult, setUsernameResult] = useState({
        message: '',
        color: ''
    });

    const [passwordResult, setPasswordResult] = useState({
        message: '',
    });

    const [emailResult, setEmailResult] = useState({
        message: ''
    });

    const [hasTyped, setHasTyped] = useState({
        username: false,
        password: false,
        email: false
    }); 

    const inputRegister = (e) => {
        const { name, value } = e.target;
        setRegister({
            ...register,
            [name]: value
        });

        if (name === 'username') {
            setHasTyped({
                ...hasTyped,
                username: true
            });
        }

        if (name === 'password') {
            setHasTyped({
                ...hasTyped,
                password: true
            })
        }
    }

    const inputLogin = (e) => {
        const { name, value } = e.target;

        setLogin({
            ...login,
            [name]: value
        })
    }

    useEffect(() => {
        if (!hasTyped.username) {
            return;
        }

        if (register.username === '') {
            setUsernameResult({
                message: 'Username cannot be empty.',
                color: 'red'
            });
            return;
        }

        const validInputUser = usernameRegex(register.username);

        if (validInputUser.valid) {
            setUsernameResult({
                message: `${register.username} is a valid username.`,
                color: 'grey'
            });

            const checkDuplicateUsername = async () => {
                const duplicateUsername = await duplicateUsernameVerify(register.username);
                if (duplicateUsername) {
                    setUsernameResult({
                        message: duplicateUsername,
                        color: 'red'
                    });
                }
            };

            checkDuplicateUsername();
        } 
        else {
            const errorMessage = validInputUser.errors[0];
            setUsernameResult({
                message: errorMessage,
                color: 'red'
            });
        }
    }, [register.username]);

    useEffect(() => {
        if (!hasTyped.password) {
            return;
        }

        if (register.password === '') {
            setPasswordResult({
                message: 'Password is required.'
            });
        }
        else {
            setPasswordResult({
                message: ''
            })
        }
    }, [register.password]);

    useEffect(() => {
        if (register.email === '') {
            setEmailResult({
                message: '',
            });
            return;
        }

        const validInputEmail = emailRegex(register.email);

        if (validInputEmail.valid) {
            setEmailResult({
                message: '',
            });
        } 
        else {
            const errorMessage = validInputEmail.error;
            setEmailResult({
                message: errorMessage,
            });
        }
    }, [register.email]);

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const validateForm = async () => {
            setRegisterError({ message: '' });
    
            const usernameValid = usernameRegex(register.username).valid;
            const emailValid = emailRegex(register.email).valid || register.email === '';
            const passwordValid = register.password !== '';
    
            // 비동기 함수 호출
            let isUsernameDuplicate = false;
            if (usernameValid) {
                isUsernameDuplicate = await duplicateUsernameVerify(register.username);
            }
    
            setIsFormValid(usernameValid && passwordValid && emailValid && !isUsernameDuplicate);
        };
    
        validateForm();
    }, [register.username, register.password, register.email]);

    const { executeRecaptcha } = useGoogleReCaptcha();

    const [registerError, setRegisterError] = useState({
        message: ''
    });

    const submitRegisterForm = async (e) => {
        e.preventDefault();

        setRegisterError({ message: '' });

        if (!executeRecaptcha) {
            setRegisterError({ message: "reCAPTCHA verification failed." });
            return;
        }

        try {
            const token = await executeRecaptcha('register');

            if (!token) {
                console.log('reCAPTCHA verification failed.');
                return;
            }

            if (isFormValid) {
                const response = await axios.post('http://localhost:3100/api/register', {
                    ...register,
                    token: token
                });

                setRefreshToken(response.data.refreshToken);
                setAccessToken(response.data.accessToken);

                setUsername(response.data.savedData.username);

                navigate('/main');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            setRegisterError({ message: errorMessage });
        }
    }

    const [loginError, setLoginError] = useState({
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const submitLoginForm = async (e) => {
        e.preventDefault();
        setLoading(true);

        setLoginError({ message: '' });

        if (!executeRecaptcha) {
            setLoginError({ message: 'reCAPTCHA verification failed.' });
            return;
        }

        try {
            const token = await executeRecaptcha('login');

            if (!token) {
                setLoginError({ message: 'reCAPTCHA verification failed.' });
                return;
            }

            const response = await axios.post('http://localhost:3100/api/login', {
                ...login,
                token: token
            });

            setAccessToken(response.data.accessToken);
            setRefreshToken(response.data.refreshToken);

            setUsername(response.data.user.username);

            navigate('/main');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            setLoginError({ message: errorMessage });
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    const [preLook, setPreLook] = useState(false);

    return (
        <main className='login-bind'>
            <div className={`login-container ${isSignin ? "sign-up-mode" : ""}`}>
                <section className='forms-container'>
                    <div className="signin-signup">
                        {/*
                            ----- # 로그인 폼 # -----
                        */}
                        <form className="sign-in-form" onSubmit={submitLoginForm}>
                            <h2 className='title'>Sign in</h2>
                            <div className='input-field'>
                                <FontAwesomeIcon icon="fa-solid fa-user" className='icon'/>
                                <input 
                                    type='text' 
                                    placeholder='Username'
                                    name='username'
                                    value={login.username}
                                    onChange={inputLogin}
                                />
                            </div>
                            <div className='input-field'>
                                <FontAwesomeIcon icon="fa-solid fa-lock" className='icon'/>
                                <input 
                                    type='password' 
                                    placeholder='Password'
                                    name='password'
                                    value={login.password}
                                    onChange={inputLogin}
                                />
                            </div>
                            {loginError && <span className='error-message red'>{loginError.message}</span>}
                            {loading ? (
                                <div className='sign-in-btn center'>
                                    <Loading/>
                                </div>
                            ) : (
                                <input type='submit' value="Login" className='sign-in-btn'/>
                            )}
                            <p className='social-text'>Or sign in with social platform</p>
                            <div className='social-media'>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faFacebook} className='icon'/>
                                </a>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faXTwitter} className='icon'/>
                                </a>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faGoogle} className='icon'/>
                                </a>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faInstagram} className='icon'/>
                                </a>
                            </div>
                        </form>
                        {/*
                            ----- # 회원가입 폼 # -----
                        */}
                        <form className="sign-up-form" onSubmit={submitRegisterForm}>
                            <h2 className='title'>Sign up</h2>
                            <div className='input-field'>
                                <FontAwesomeIcon icon="fa-solid fa-user" className='icon'/>
                                <input 
                                    type='text' 
                                    placeholder='Username'
                                    name='username'
                                    value={register.username}
                                    onChange={inputRegister}
                                    autoComplete='new-login'
                                />
                            </div>
                            <span className={`error-message ${usernameResult.color}`}>{usernameResult.message}</span>
                            <div className='input-field pre-look'>
                                <FontAwesomeIcon icon="fa-solid fa-lock" className='icon'/>
                                <input 
                                    type={preLook ? 'text' : 'password'}
                                    placeholder='Password'
                                    name='password'
                                    value={register.password}
                                    onChange={inputRegister}
                                    autoComplete='new-password'
                                />
                                <FontAwesomeIcon 
                                    icon={`fa-solid ${preLook ? 'fa-eye-slash' : 'fa-eye'}`} 
                                    className='icon' 
                                    onClick={() => setPreLook(!preLook)}
                                />
                            </div>
                            <span className='error-message red'>{passwordResult.message}</span>
                            <div className='input-field'>
                                <FontAwesomeIcon icon="fa-solid fa-envelope" className='icon'/>
                                <input 
                                    type='text' 
                                    placeholder='(Option) Email'
                                    name='email'
                                    value={register.email}
                                    onChange={inputRegister}
                                />
                            </div>
                            <span className='error-message red'>{emailResult.message}</span>
                            <span className='error-message red'>{registerError.message}</span>
                            <input 
                                type='submit' 
                                value="Sign up" 
                                className={`sign-in-btn ${!isFormValid ? "unvalid-register" : "register"}`}
                                disabled={!isFormValid}
                            />
                            <p className='social-text'>Or sign up with social platform</p>
                            <div className='social-media'>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faFacebook} className='icon'/>
                                </a>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faXTwitter} className='icon'/>
                                </a>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faGoogle} className='icon'/>
                                </a>
                                <a href='#' className='social-icon'>
                                    <FontAwesomeIcon icon={faInstagram} className='icon'/>
                                </a>
                            </div>
                        </form>
                    </div>
                </section>
                <section className='panels-container'>
                    <div className='panel left-panel'>
                        <div className='content'>
                            <h3>New here?</h3>
                            <p>Create an account to create and check out your own small plant growth projects.</p>
                            <button className='sign-in-btn transparent'
                                onClick={() => setIsSignin(true)}
                            >
                                Sign up
                            </button>
                        </div>
                        <img src="../../images/log.svg" className='login-image' alt=""/>
                    </div>
                    <div className='panel right-panel'>
                        <div className='content'>
                            <h3>Already have an account?</h3>
                            <p>If you already have an account, please log in to access your account and continue make your project run.</p>
                            <button className='sign-in-btn transparent'
                                onClick={() => setIsSignin(false)}
                            >
                                Sign in
                            </button>
                        </div>
                        <img src="../../images/register.svg" className='login-image' alt=""/>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Login;