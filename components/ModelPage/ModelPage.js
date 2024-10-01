'use client'

import React from "react";
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const gltfUrl = 'model.glb'
let currentgltf = null
const videoTextureURL = 'pol.mp4'

export default function ModelPage() {
  function StartThree() {

    const scene = new THREE.Scene()

    const container = document.getElementById('three')
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const width = container.clientWidth,
      height = container.clientHeight
    renderer.setSize(width, height)
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.5, 1000);
    camera.position.set(0, 0.3, 6);

    //on window resize
    window.addEventListener('resize', () => {
      const width = container.clientWidth,
        height = container.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    })

    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(0, 10, 0);
    scene.add(light);

    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
    scene.add(ambientLight);

    const loader = new GLTFLoader()

    async function LoadGLTF(url, progressCallback) {
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          function (gltf) {
            resolve(gltf)
          },
          function (xhr) {
            if (progressCallback) progressCallback(xhr.loaded / xhr.total)
          },
          function (error) {
            reject(error)
          }
        )
      })
    }

    LoadGLTF(gltfUrl, (progress) => {
      console.log(progress)
    }).then((gltf) => {
      currentgltf = gltf

      currentgltf.scene.rotation.x = 0
      currentgltf.scene.rotation.y = Math.PI / 2
      scene.add(gltf.scene)
    }).catch((error) => {
      console.error(error)
    });

    renderer.setAnimationLoop(render)
    function render(timestamp, frame) {
      renderer.render(scene, camera)
    }
  }

  React.useEffect(() => {
    StartThree()

    //when mouse moves, rotate currentgltf
    document.addEventListener('mousemove', (event) => {
      if (currentgltf) {
        //look at mouse
        const x = event.clientX
        const y = event.clientY

        const width = window.innerWidth
        const height = window.innerHeight

        const xpercent = x / width
        const ypercent = y / height

        const xangle = (xpercent - 0.5) * Math.PI
        const yangle = (ypercent - 0.5) * Math.PI

        currentgltf.scene.rotation.x = yangle / 100
        currentgltf.scene.rotation.y = xangle / 100 + Math.PI / 2
      }
    })
  }, [])

  return (
    <>
      <div style={{ width: '100%', height: '100vh' }}>
        <video autoPlay muted loop style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}>
          <source src={videoTextureURL} type='video/mp4' />
        </video>
        <div
          id='three'
          style={{ backgroundColor: 'transparent', width: '100%', height: '100%', position: 'absolute' }}
        ></div>
        <div style={{ position: 'absolute', margin: '40pt' }}>
          <h1>PrisaX PoV</h1>
        </div>
        <div style={{
          position: 'relative', width: '100%', textAlign: 'center', top: '50%', transform: 'translateY(-50%)', zIndex: 1,
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '100pt',
          fontSize: '20pt', lineHeight: '28pt'
        }}>
          <div>
            <p>First Person</p>
            <p>View Data</p>
          </div>
          <div>
            <p>High Quality</p>
            <p>Data for Gen AI</p>
          </div>
        </div>
      </div >
    </>
  )
}