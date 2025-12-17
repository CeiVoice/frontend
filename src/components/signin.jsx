import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { IoMdArrowBack } from "react-icons/io";
function Signin({ onSuccess, onBack, onRegister }) {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const url = "https://script.google.com/macros/s/AKfycbw1atMa-V_lzvQ-QqdczeO0peeg_Xfnbl6fBVvXbrZB5Np9id3zCCf5TL-BX80n8bHZ_Q/exec"
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=login&Gmail=${encodeURIComponent(e.target.Gmail.value)}&Password=${encodeURIComponent(e.target.Password.value)}`
        })
            .then(res => res.text())
            .then(message => {
                console.log('Server response:', message); // Debug log
                const msg = message.toLowerCase().trim();
                if (msg.includes('ok') || msg.includes('success') || msg.includes('login successful')) {
                    onSuccess?.(e.target.Gmail.value);
                } else if (msg.includes('wrong') || msg.includes('incorrect')) {
                    alert('Wrong email or password.');
                } else if (msg.includes('not found') || msg.includes('does not exist')) {
                    alert('Account does not exist.');
                } else {
                    alert('Unexpected response: ' + message);
                }
            })
            .catch(err => {
                console.log(err);
                alert('Something went wrong. Please try again.');
            })
    }


    return (
        <div className='flex bg-gray-100 w-screen h-screen justify-center items-center'>
            <div className='bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center p-10 gap-8 w-full'>
                    <p className='text-black text-2xl pt-5'>Sign in</p>
                    <input className=' rounded-3xl w-full border block border-black px-3 py-2' type="email" name='Gmail' placeholder='Example@gmail.com' required />
                    <div className='relative w-full'>
                        <input
                            className=' rounded-3xl w-full border block border-black pr-10 px-3 py-2'
                            type={showPassword ? 'text' : 'password'}
                            name='Password'
                            placeholder='Password'
                            required
                        />

                        <button
                            type='button'
                            className='absolute right-5 top-1/2 -translate-y-1/2 text-black-600 text-sm cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <button type="submit" className=' cursor-pointer bg-[#4377E5] text-white rounded-3xl w-full h-10 hover:bg-blue-700'>Sign in</button>
                    <div className=' flex flex-row gap-2 '>
                        <p>Don't have an account?</p>
                        <button
                            type='button'
                            className=' cursor-pointer font-bold underline text-[#4377E5] '
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
                    <hr className='w-full border-t border-gray-300' />
                    <div className='pointer-fine:hover:bg-gray-200 flex items-center justify-center gap-2 border rounded-3xl w-full px-2 py-3 cursor-pointer'>
                        <p className='flex flex-row gap-3'><FcGoogle size={24} />Sign in with Google</p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signin