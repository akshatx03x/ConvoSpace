import React from 'react'
import { Input } from "@/components/ui/input"

export function InputDemo() {
  return <Input type="email" placeholder="Email" />
}

const Login = () => {
  return (
    <div>
        <div className="">Hi</div>
      <div className='text-5xl font-bold flex items-center justify-center'>Login Page</div>
      <InputDemo />
    </div>
  )
}

export default Login
