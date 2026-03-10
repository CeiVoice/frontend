import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { IoMdArrowBack } from "react-icons/io";
import API_BASE from '../../config/api';
import frameLogo from '../../assets/Frame_6.png';
function Signup({ onSuccess, onBack }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if passwords match
        if (e.target.Password.value !== e.target.Confirmpassword.value) {
            alert('Passwords do not match!');
            return;
        }

        const url = `${API_BASE}/auth/signup`
        const payload = {
            Email: e.target.Gmail.value,
            Password: e.target.Password.value,
            Fname: e.target.Fname.value,
            Lname: e.target.Lname.value
        };
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.text())
            .then(message => {
                const lowered = message.toLowerCase();
                if (lowered.includes("duplicate") || lowered.includes("already") || lowered.includes("exists")) {
                    alert("Account already exists.");
                    return;
                }
                // If not duplicate, treat as success
                alert("A confirmation email has been sent to your email. Please verify your email before signing in.");
                if (onBack) {
                    onBack(); // Return to login page
                }
            })
            .catch(err => {
                console.log(err);
                alert("Something went wrong. Please try again.");
            })
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
                <div className='absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#e2e543] to-black opacity-60 blur-3xl'></div>
                <div className='flex flex-row gap-2 mb-5'>
                    <p className='text-white text-3xl lg:text-[45px] font-bold text-center leading-tight'>Join CEIVoice!</p>
                </div>
                <p className='text-white text-sm lg:text-[18px] text-center leading-relaxed'>
                    Our platform helps report issues, track ticket progress,
                </p>
                <p className='text-white text-sm lg:text-[18px] text-center leading-relaxed'>
                    and collaborate with the support team to resolve problems quickly.
                </p>
            </div>
            {/*Right sign up*/}
            <div className='bg-white w-full md:w-1/3 h-full flex items-center justify-center overflow-y-auto'>
                <div className='w-full max-w-sm md:max-w-md px-8'>
                    <IoMdArrowBack
                        size={24}
                        className='cursor-pointer mb-4'
                        onClick={() => {
                            if (onBack) {
                                onBack();
                            } else {
                                window.history.back();
                            }
                        }}
                    />
                    <form onSubmit={handleSubmit} className='flex flex-col items-center gap-5 w-full'>
                        <img src={frameLogo} alt="Frame" className='w-auto h-auto' />
                        <p className='self-start text-black text-2xl'>Sign up</p>
                        <input className='block px-3 py-2 border border-black rounded-3xl w-full' type="text" name='Fname' placeholder='First Name' required />
                        <input className='block px-3 py-2 border border-black rounded-3xl w-full' type="text" name='Lname' placeholder='Last Name' required />
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
                        <div className='relative w-full'>
                            <input
                                className='block px-3 py-2 pr-10 border border-black rounded-3xl w-full'
                                type={showConfirmPassword ? 'text' : 'password'}
                                name='Confirmpassword'
                                placeholder='Confirm Password'
                                required
                            />
                            <button
                                type='button'
                                className='top-1/2 right-5 absolute text-black-600 text-sm -translate-y-1/2 cursor-pointer'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <button type="submit" className='bg-[#000000] hover:bg-[#7a7979] rounded-3xl w-full h-10 text-white cursor-pointer'>Sign up</button>
                        <hr className='border-gray-300 border-t w-full' />
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => alert('Google sign in failed.')}
                            width='100%'
                        />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup