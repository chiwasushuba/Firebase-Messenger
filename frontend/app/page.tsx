'use client'

import { useState } from "react";

export default function Home() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<null>()

  return (
    <div className="flex justify-center items-center">
      {isLoggedIn && <p>user {user} is loggedIn</p>}
      test
    </div>
  );
}
