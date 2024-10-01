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
    </>

  )
}