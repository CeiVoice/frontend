import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import API_BASE from '../../config/api';
import frameLogo from '../../assets/Frame_6.png';
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
        <div className='flex w-screen h-screen overflow-hidden'>
            {/*Left */}
            <div className='hidden md:flex w-2/3 h-full bg-[#000000] flex-col items-center justify-center px-10 relative overflow-hidden'>
                {/* Gradient circle */}
                <div className='absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#e2e543] to-black opacity-60 blur-3xl'></div>
                <div className='flex flex-row mb-5'>
                    <div className='flex flex-row gap-2'>
                        <p className='text-white text-3xl lg:text-[45px] font-bold text-center leading-tight'>Welcome to</p>
                        <p className='text-white text-3xl lg:text-[45px] font-bold text-center leading-tight'>CEI</p>
                    </div>
                    <p className='text-white text-3xl lg:text-[45px] font-bold text-center leading-tight'>Voice!</p>
                </div>
                <p className='text-white text-sm lg:text-[18px] text-center leading-relaxed'>
                    Our platform helps report issues, track ticket progress,
                </p>
                <p className='text-white text-sm lg:text-[18px] text-center leading-relaxed'>
                    and collaborate with the support team to resolve problems quickly.
                </p>
            </div>
            {/*Right sign in*/}
            <div className='bg-[#ffffff] w-full md:w-1/3 h-full flex items-center justify-center overflow-y-auto'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center gap-6 px-8 py-10 w-full max-w-sm md:max-w-md'>
                    <img src={frameLogo} alt="Frame" className='w-auto h-auto' />
                    <p className='self-start text-black text-2xl font-semibold'>Sign in</p>
                    <input className='block px-3 py-2 border border-black rounded-3xl w-full bg-white' type="email" name='Gmail' placeholder='Example@gmail.com' required />
                    <div className='relative w-full'>
                        <input
                            className='block px-3 py-2 pr-10 border border-black rounded-3xl w-full bg-white'
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

                    <button type="submit" className='bg-[#000000] hover:bg-[#7a7979] rounded-3xl w-full h-10 text-white cursor-pointer'>Sign in</button>
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