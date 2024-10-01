'use client'

import React from "react";
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import AnimText from "../animtext/AnimText";

const videoTextureURL = 'circle.mov'

export default function ModelPage() {
  function StartThree() {
    const scene = new THREE.Scene()

    const container = document.getElementById('three1')
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    container.appendChild(renderer.domElement)

    const width = container.clientWidth,
      height = container.clientHeight
    renderer.setSize(width, height)
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.05, 100)
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)

    //on window resize
    window.addEventListener('resize', () => {
      const width = container.clientWidth,
        height = container.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    })

    //create a plane and use the video as texture
    const video = document.createElement('video')
    video.src = videoTextureURL
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true
    video.play()
    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.flipY = false
    const plane = new THREE.PlaneGeometry(5, 5)
    const material = new THREE.MeshBasicMaterial({ map: videoTexture })
    const mesh = new THREE.Mesh(plane, material)
    scene.add(mesh)

    renderer.setAnimationLoop(render)
    function render(timestamp, frame) {
      renderer.render(scene, camera)
    }
  }

  const [playing, setPlaying] = React.useState(false)
  const [completed, setCompleted] = React.useState(false)
  const [buttonText, setButtonText] = React.useState('ENTER')

  React.useEffect(() => {
    StartThree()
  }, [])


  const [text, setText] = React.useState('This is a video texture')
  async function play() {
    setButtonText('REPLAY')

    setInterval(() => {
      const randString = Math.random().toString(36) + '\n' + Math.random().toString(36)
console.log('randString', randString)
      setText(randString);
    }, 10000);
  }

  React.useEffect(() => {
    if (playing) {
      play()
    }
  }, [playing])

  return (
    <>
      <div style={{ width: '100%', height: 'calc(100vh - 60pt)' }}>
        <div
          id='three1'
          style={{ backgroundColor: 'transparent', width: '100%', height: '70%', position: 'absolute' }}
        ></div>
        <div style={{ position: 'absolute', bottom: '40pt', margin: '0pt 40pt', zIndex: 1 }}>
          <AnimText text={text} />
        </div>
        <div style={{
          display: playing ? 'none' : 'block',
          position: 'absolute', bottom: '60pt', width: '100%', height: '20pt', backgroundColor: 'black', color: 'white', textAlign: 'center'
        }}>
          <button onClick={() => {
            setPlaying(true)
          }}>{buttonText}</button>
        </div>
      </div>
    </>
  )
}