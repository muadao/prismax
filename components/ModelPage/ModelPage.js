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
    const camera = new THREE.PerspectiveCamera(75,width / height, 0.1, 1000);
    camera.position.z = 10;

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
    videoTexture.encoding = THREE.sRGBEncoding
    const plane = new THREE.PlaneGeometry(20, 10)
    const material = new THREE.MeshBasicMaterial({ map: videoTexture })
    const mesh = new THREE.Mesh(plane, material)
    scene.add(mesh)
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

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
        <div
          id='three'
          style={{ backgroundColor: 'transparent', width: '100%', height: '100%' }}
        ></div>
      </div>
    </>
  )
}