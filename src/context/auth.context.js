import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5005';
const AuthContext = React.createContext();

function AuthProviderWrapper(props) {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoaded] = useState(true);
    const [user, setUser] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    
    const storeToken = (token) => {
        localStorage.setItem('authToken', token);
    };

    const getToken = (token) => {
        return localStorage.getItem('authToken', token);
    };

    const authenticateUser = () => {
        const storeToken = localStorage.getItem('authToken');

        if (storeToken) {
            axios
                .get(`${API_URL}/auth/verify`, {
                    headers: { Authorization: `Bearer ${storeToken}` },
                })
                .then((response) => {
                    return axios.get(
                        `${API_URL}/api/user/${response.data._id}`,
                        {
                            headers: { Authorization: `Bearer ${storeToken}` },
                        }
                    );
                })
                .then((response) => {
                    const user = response.data;
                    console.log(response.data)
                    setUser(user);
                    setIsLoggedIn(true);
                    setIsLoaded(false);
                })
                .catch((err) => {
                    setIsLoaded(false);
                    setIsLoggedIn(false);
                    setUser(null);
                });
        } else {
            setIsLoggedIn(false);
            setIsLoaded(false);
            setUser(null);
        }
    };

    const removeToken = () => {
        localStorage.removeItem('authToken');
    };

    const logOutUser = () => {
        removeToken();
        authenticateUser();
        navigate('/auth/login');
    };

    const checkIfOwner = (adId) => {
        if(!user) {
            setIsOwner(false)
        }

        else if(user.ads.includes(adId) ) {
            setIsOwner(true)
        } else {
            setIsOwner(false)
        }
    }

    useEffect(() => {
        authenticateUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                isLoading,
                user,
                isOwner,
                storeToken,
                getToken,
                authenticateUser,
                logOutUser,
                checkIfOwner,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}

export { AuthProviderWrapper, AuthContext };
