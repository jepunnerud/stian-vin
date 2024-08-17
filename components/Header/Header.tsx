import React from 'react'
import AuthButton from "../AuthButton"
import Link from 'next/link';

const Header = () => {
  return (
    <div className="flex w-full border-b-2">
        {/* Button that sends the user to /review */}
        <Link href="/" className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
            Home
        </Link>
        <Link href="/review" className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
            Review
        </Link>


      <AuthButton />
    </div>
  )
}

export default Header
