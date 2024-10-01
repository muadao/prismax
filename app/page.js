'use client'

import React from "react";
import ModelPage from '../components/ModelPage/ModelPage'
import Navbar from "../components/navbar/navbar";
import Intro from '../components/intro/Intro'
import Third from '../components/third/Third'

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Intro />
      <ModelPage />
      <Third />
      <div style={{
        height: '40pt', width: '80%', margin: '0pt 10%',
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', gap: '20pt'
      }}>
        <img src='/logo.svg' alt='footer' style={{ height: '40pt' }} />
        <p
          style={{ fontSize: '14pt', color: 'rgba(255, 255, 255, 0.7)' }}
        >A Base Layer for Real-World Multimodal GenAI Apps</p>
      </div>
      <br />
    </>

  )
}