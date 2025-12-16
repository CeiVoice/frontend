import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { IoMdArrowBack } from "react-icons/io";
function Signin({ onSuccess, onBack }) {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const url = "https://script.google.com/macros/s/AKfycbxPi4juehm7LeZC-lpvpUIV2BiUWJlPjs1HIb_RDzibhwNGr1z0RJMIyoRGrkHXg1oiqQ/exec"
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=signup&Email=${encodeURIComponent(e.target.Email.value)}&Password=${encodeURIComponent(e.target.Password.value)}`
        })
            .then(res => res.text())
            .then(message => {
                const lowered = message.toLowerCase();
                if (lowered.includes("duplicate") || lowered.includes("already") || lowered.includes("exists")) {
                    alert("Account already exists.");
                    return;
                }
                // If not duplicate, treat as success
                alert("Successfully created account.");
                if (onBack) {
                    onBack(); // Return to login page
                }
            })
            .catch(err => {
                console.log(err);
                alert("Something went wrong. Please try again.");
            })
    }


    return (
        <div className='flex bg-gray-100 w-screen h-screen justify-center items-center'>
            <div className='bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg'>
                <IoMdArrowBack
                    size={24}
                    className='cursor-pointer'
                    onClick={() => {
                        if (onBack) {
                            onBack();
                        } else {
                            window.history.back();
                        }
                    }}
                />
                <form onSubmit={handleSubmit} className='flex flex-col items-center p-10 gap-8 w-full'>
                    <p className='text-black text-2xl pt-5'>Sign in</p>
                    <input className='font-sans rounded-3xl w-full border block border-black px-3 py-2' type="text" name='Email' placeholder='Example@kmitl.ac.th' required />
                    <div className='relative w-full'>
                        <input
                            className='font-sans rounded-3xl w-full border block border-black pr-10 px-3 py-2'
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

                    <button type="submit" className='font-sans cursor-pointer bg-[#4377E5] text-white rounded-3xl w-full h-10 hover:bg-blue-700'>Sign in</button>
                    <hr className='w-full border-t border-black' />
                    <div className='pointer-fine:hover:bg-gray-200 flex items-center justify-center gap-2 border rounded-3xl w-full px-2 py-3 cursor-pointer'>
                        <p className='flex flex-row gap-3'><FcGoogle size={24} />Sign in with Google</p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signin