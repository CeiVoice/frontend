import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { IoMdArrowBack } from "react-icons/io";
import API_BASE from '../../config/api';
function Signin({ onSuccess, onBack, onRegister }) {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${API_BASE}/auth/signin`
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Email: e.target.Gmail.value,
                    Password: e.target.Password.value
                })
            })

            const data = await res.json()
            if (data?.success && data?.token) {
                localStorage.setItem('authToken', data.token.token)
                onSuccess?.(e.target.Gmail.value)
                return
            }

            const message = data?.error || 'Login failed.'
            alert(message)
        } catch (err) {
            console.log(err);
            alert('Something went wrong. Please try again.');
        }
    }


    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${API_BASE}/auth/signin/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: credentialResponse.credential })
            });
            const data = await res.json();
            if (data?.success && data?.token) {
                localStorage.setItem('authToken', data.token.token ?? data.token);
                onSuccess?.();
                return;
            }
            alert(data?.error || 'Google sign in failed.');
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <div className='flex justify-center items-center bg-linear-to-tl from-[#4377E5] to-[#BFCDE9] w-screen h-screen'>
            <div className='bg-white shadow-lg p-6 sm:p-8 rounded-3xl w-full max-w-md sm:max-w-lg md:max-w-xl'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center gap-8 p-10 w-full'>
                    <img src="/src/assets/Frame_6.png" alt="Frame" className='w-auto h-auto' />
                    <p className='self-start text-black text-2xl'>Sign in</p>
                    <input className='block px-3 py-2 border border-black rounded-3xl w-full' type="email" name='Gmail' placeholder='Example@gmail.com' required />
                    <div className='relative w-full'>
                        <input
                            className='block px-3 py-2 pr-10 border border-black rounded-3xl w-full'
                            type={showPassword ? 'text' : 'password'}
                            name='Password'
                            placeholder='Password'
                            required
                        />

                        <button
                            type='button'
                            className='top-1/2 right-5 absolute text-black-600 text-sm -translate-y-1/2 cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <button type="submit" className='bg-[#4377E5] hover:bg-blue-700 rounded-3xl w-full h-10 text-white cursor-pointer'>Sign in</button>
                    <div className='flex flex-row gap-2'>
                        <p>Don't have an account?</p>
                        <button
                            type='button'
                            className='font-bold text-[#4377E5] underline cursor-pointer'
                            onClick={() => {
                                if (onRegister) {
                                    onRegister();
                                } else {
                                    window.location.href = '/signup';
                                }
                            }}
                        >
                            Sign up
                        </button>
                    </div>
                    <hr className='border-gray-300 border-t w-full' />
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => alert('Google sign in failed.')}
                        useOneTap
                        width='100%'
                    />
                </form>
            </div>
        </div>
    )
}

export default Signin