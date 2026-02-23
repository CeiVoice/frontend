import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { IoMdArrowBack } from "react-icons/io";
function Signin({ onSuccess, onBack, onRegister }) {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = "http://localhost/auth/signin"
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
                localStorage.setItem('authToken', data.token)
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


    return (
        <div className='flex bg-linear-to-tl from-[#4377E5] to-[#BFCDE9] w-screen h-screen justify-center items-center'>
            <div className='bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center p-10 gap-8 w-full'>
                    <img src="/src/assets/Frame_6.png" alt="Frame" className='w-auto h-auto' />
                    <p className='text-black text-2xl self-start'>Sign in</p>
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