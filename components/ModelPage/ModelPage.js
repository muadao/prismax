'use client'

import React from "react";
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'

const gltfUrl = 'model.gltf'
let currentgltf = null

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
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.05, 100)
    camera.position.set(0,2,10)
    camera.lookAt(0, 0, 0)

    //on window resize
    window.addEventListener('resize', () => {
      const width = container.clientWidth,
        height = container.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    })

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    const hdriLoader = new RGBELoader()
    let hdri = null
    hdriLoader.load('/hdri.hdr', function (texture) {
      hdri = pmremGenerator.fromEquirectangular(texture).texture
      texture.dispose()
      scene.environment = hdri
      //scene.background = hdri

      pmremGenerator.dispose()

      //render
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1
    })


    const light = new THREE.AmbientLight(0x404040, 0.9);
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)


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