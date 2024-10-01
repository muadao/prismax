'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './navbar.module.css'

const Navbar = () => {
  return (
    <>
      <div className={styles.navbar}>
        <Link href='/' className={styles.logo}>
          <img src='/logo.svg' alt='logo' className={styles.logoimg} />
        </Link>
        <div id='links' className={styles.links} style={{ display: 'none' }}>
          <Link href='/' className={styles.link} style={{ color: 'white' }}>
            Example
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar
