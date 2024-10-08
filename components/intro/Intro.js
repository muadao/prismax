'use client'

import React from "react";
import AnimText from "../animtext/AnimText";
import * as THREE from 'three';
import {createNoise3D} from 'simplex-noise';
import * as TWEEN from '@tweenjs/tween.js'

//region: configs
const videoUrls = ['video1.mp4', 'video2.mp4', 'video3.mp4']

const particleSizeBase = .1
const particleSizeAlter = .03
const spawnRadius = 2.4
const sqrRadius = spawnRadius * spawnRadius

const particleNum = 20000

const sampleScalar = 1000
const timeScalar = 0.2
const amplitude = 0.1
//endregion

export default function ModelPage() {
    const [playing, setPlaying] = React.useState(false)
    const [completed, setCompleted] = React.useState(false)
    const [buttonText, setButtonText] = React.useState('ENTER')

    let container = null
    let width, height = null
    let renderer = null
    let renderTarget = null
    let noise = null

    let particleScene = null
    let videoScene = null

    let videoElements = []
    let videoTextures = []

    let videoMaterial = null

    let camera = null

    let time = 0
    let vidParticle = null

    let vidParticleParams = {
        progress: 0,
        spreadBase: 0.8,
        spreadAlter: 0.2,
    }

    const group = new TWEEN.Group()

    function OnResize() {
        width = container.clientWidth
        height = container.clientHeight
        renderer.setSize(width, height)
        renderTarget.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }

    function InitScene() {
        container = document.getElementById('three1')
        width = container.clientWidth, height = container.clientHeight

        renderer = new THREE.WebGLRenderer({stencil: true})
        renderer.setSize(width, height)
        renderer.autoClear = false
        container.appendChild(renderer.domElement)
        renderTarget = new THREE.WebGLRenderTarget(width, height)
        noise = createNoise3D()

        particleScene = new THREE.Scene()
        videoScene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, width / height, 0.05, 1000)
        camera.position.set(0, 0, 7)
        camera.lookAt(0, 0, 0)
        window.addEventListener('resize', OnResize)
    }

    function InitVideoAndTextures() {
        videoUrls.forEach(url => {
            const video = document.createElement('video')
            video.src = url
            video.crossOrigin = 'anonymous'
            video.loop = true
            video.muted = false
            videoElements.push(video)

            const videoTexture = new THREE.VideoTexture(video)
            videoTexture.minFilter = THREE.LinearFilter
            videoTexture.magFilter = THREE.LinearFilter
            videoTexture.format = THREE.RGBFormat
            videoTextures.push(videoTexture)
        })

        const videoGeometry = new THREE.PlaneGeometry(5, 5)
        videoMaterial = new THREE.MeshBasicMaterial({map: videoTextures[0]})
        const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial)
        videoScene.add(videoPlane)
    }

    function InitVidParticles() {
        const psMat = new THREE.ShaderMaterial({
            uniforms: {
                videoTexture: {value: renderTarget.texture},
                spreadProgress: {value: 0}
            }, vertexShader: `
    attribute float size;
    varying vec4 vScreenPosition;
    uniform float spreadProgress;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z) * (0.5+ 0.5 * spreadProgress);
      gl_Position = projectionMatrix * mvPosition;
      vScreenPosition = gl_Position;
    }
  `, fragmentShader: `
    uniform vec3 color;
    uniform sampler2D videoTexture;
    varying vec4 vScreenPosition;
    uniform float spreadProgress;
    void main() {
        vec2 screenUV = vScreenPosition.xy / vScreenPosition.w * 0.5 + 0.5;
        vec4 videoColor = texture2D(videoTexture, screenUV);
        float x =  gl_PointCoord.x -0.5;
        float y =  gl_PointCoord.y -0.5;
       
        if (x * x +y* y < 0.25){
        // interpolate video color with white color
            gl_FragColor = mix(vec4(0,0,0,0), videoColor, spreadProgress);
        }else{
            gl_FragColor = vec4(0,0,0,0);
        }
    }
  `, transparent: true, depthWrite: false, alphaTest: 0.5
        });
        const psGeo = new THREE.BufferGeometry()
        const vertices = []
        const sizes = []

        for (let i = 0; i < particleNum; i++) {
            let x, y;
            do {
                x = (Math.random() * 2 - 1) * spawnRadius;
                y = (Math.random() * 2 - 1) * spawnRadius;
            } while (x * x + y * y > sqrRadius);

            vertices.push(x);
            vertices.push(y);
            vertices.push(0);

            sizes.push(particleSizeBase + Math.random() * particleSizeAlter);
        }

        const originalVertices = vertices.slice()

        psGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        psGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))


        const particles = new THREE.Points(psGeo, psMat)
        particleScene.add(particles)

        vidParticle = {psMat, psGeo, vertices, sizes, originalVertices, particles}
    }

    function InitNonVidParticles(timestamp) {
        time = timestamp / 1000
        const psMat = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            sizeAttenuation: true
        })
    }

    function updateVidParticles(timestamp) {
        time = timestamp / 1000
        const {psGeo, originalVertices} = vidParticle
        const vertices = psGeo.attributes.position.array
        for (let i = 0; i < vertices.length; i += 3) {
            const x = originalVertices[i] * (vidParticleParams.spreadBase + vidParticleParams.progress * vidParticleParams.spreadAlter)
            const y = originalVertices[i + 1] * (vidParticleParams.spreadBase + vidParticleParams.progress * vidParticleParams.spreadAlter)
            const z = originalVertices[i + 2] * (vidParticleParams.spreadBase + vidParticleParams.progress * vidParticleParams.spreadAlter)

            const moderatedAmplitude = amplitude * vidParticleParams.progress
            // * (0.6 + 0.4 * Math.sqrt((x * x + y * y) / sqrRadius))

            const noiseX = noise(sampleScalar * x, sampleScalar * y, sampleScalar * z + time * timeScalar) * moderatedAmplitude
            const noiseY = noise(sampleScalar * x + time * timeScalar, sampleScalar * y, sampleScalar * z) * moderatedAmplitude
            const noiseZ = noise(sampleScalar * x, sampleScalar * y + time * timeScalar, sampleScalar * z) * moderatedAmplitude

            vertices[i] = x + noiseX
            vertices[i + 1] = y + noiseY
            vertices[i + 2] = z + noiseZ
        }

        psGeo.attributes.position.needsUpdate = true
    }

    function updateNonVidParticles(timestamp) {

    }

    function StartThree() {
        InitScene()
        InitVideoAndTextures()
        InitVidParticles()
        videoElements[0].play()

        startTween()

        function render(timestamp) {
            requestAnimationFrame(render)
            group.update(timestamp)

            updateVidParticles(timestamp)
            renderer.setRenderTarget(renderTarget)
            renderer.render(videoScene, camera)

            renderer.setRenderTarget(null)
            renderer.clear()
            renderer.render(particleScene, camera)
        }

        render(0)
    }

    function startTween() {
        const emergeTweens = []
        for (let i = 0; i < videoUrls.length; i++) {
            const emerge = new TWEEN.Tween(vidParticleParams, group)
                .to({progress: 1}, 1200)
                .onUpdate((param) => {
                    vidParticle.psMat.uniforms.spreadProgress.value = param.progress
                })
                .easing(TWEEN.Easing.Back.In)
            emergeTweens.push(emerge)
        }

        const dismissTweens = []
        for (let i = 0; i < videoUrls.length; i++) {
            const dismiss = new TWEEN.Tween(vidParticleParams, group)
                .to({progress: 0}, 1200)
                .delay(5000)
                .onUpdate((param) => {
                    vidParticle.psMat.uniforms.spreadProgress.value = param.progress
                })
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(() => {
                    const index = (i + 1) % videoUrls.length
                    videoMaterial.map = videoTextures[index]
                    videoElements[i].pause()
                    videoElements[index].play()

                    if (i === videoUrls.length - 1) {
                        // todo send out complete event
                        setCompleted(true)
                    }
                })
            dismissTweens.push(dismiss)
        }

        emergeTweens[0].chain(dismissTweens[0])
        dismissTweens[0].chain(emergeTweens[1])
        emergeTweens[1].chain(dismissTweens[1])
        dismissTweens[1].chain(emergeTweens[2])
        emergeTweens[2].chain(dismissTweens[2])

        emergeTweens[0].start()
    }

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

    return (<>
        <div style={{width: '100%', height: 'calc(100vh - 60pt)'}}>
            <div
                id='three1'
                style={{backgroundColor: 'transparent', width: '100%', height: '70%', position: 'absolute'}}
            ></div>
            <div style={{position: 'absolute', bottom: '160pt', margin: '0pt 40pt', zIndex: 1}}>
                <AnimText text={text}/>
            </div>
            <div style={{
                display: playing ? 'none' : 'block',
                position: 'absolute',
                bottom: '60pt',
                width: '100%',
                height: '20pt',
                backgroundColor: 'black',
                color: 'white',
                textAlign: 'center',
                zIndex: 2
            }}>
                <button onClick={() => {
                    setPlaying(true)
                }}>{buttonText}</button>
            </div>
        </div>
    </>)
}