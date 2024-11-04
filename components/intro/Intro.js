'use client'

import React from "react";
import AnimText from "../animtext/AnimText";
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import * as TWEEN from '@tweenjs/tween.js'

//region: configs
const videoUrls = ['video1.mp4', 'video2.mp4', 'video3.mp4']

const particleSizeBase = 6
const particleSizeAlter = 2
const spawnRadius = 2.4
const sqrRadius = spawnRadius * spawnRadius

const particleNum = 20000

//endregion

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

let vidParticleConfig = {
    progress: 0,
    spreadBase: 0.8,
    spreadAlter: 0.2,
    sampleScalar: 1000,
    timeScalar: 0.2,
    amplitude: 0.1,
}

let bgParticle = null
let bgParticleConfig = {
    num: 300,
    progress: 0,
    sampleScalar: 300,
    timeScalar: 0.07,
    amplitude: 0.1,
}

export default function ModelPage() {
    const [playing, setPlaying] = React.useState(false)
    const [completed, setCompleted] = React.useState(false)
    const [buttonText, setButtonText] = React.useState('ENTER')


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

        renderer = new THREE.WebGLRenderer({
            stencil: true,
            antialias: true
        })
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(width, height)
        renderer.autoClear = false
        container.appendChild(renderer.domElement)
        renderTarget = new THREE.WebGLRenderTarget(width, height)
        noise = createNoise3D()

        particleScene = new THREE.Scene()
        videoScene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(75, width / height, 0.05, 1000)
        camera.position.set(0, 0, 6.2)
        camera.lookAt(0, 0, 0)
        window.addEventListener('resize', OnResize)
    }

    function InitVideoAndTextures() {
        videoUrls.forEach(url => {
            const video = document.createElement('video')
            video.src = url
            video.crossOrigin = 'anonymous'
            video.loop = true
            video.muted = true
            video.playsInline = true
            videoElements.push(video)

            const videoTexture = new THREE.VideoTexture(video)
            videoTexture.minFilter = THREE.LinearFilter
            videoTexture.magFilter = THREE.LinearFilter
            videoTexture.format = THREE.RGBFormat
            videoTextures.push(videoTexture)
        })

        const videoGeometry = new THREE.PlaneGeometry(6, 6)
        videoMaterial = new THREE.MeshBasicMaterial({ map: videoTextures[0] })
        const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial)
        videoScene.add(videoPlane)
    }

    function InitVidParticles() {
        const psMat = new THREE.ShaderMaterial({
            uniforms: {
                videoTexture: { value: renderTarget.texture },
                spreadProgress: { value: 0 }
            }, vertexShader: `
    attribute float size;
    varying vec4 vScreenPosition;
    uniform float spreadProgress;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * spreadProgress * spreadProgress;
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
        float a = 1.0 - pow(1.0 - spreadProgress,3.0);
            gl_FragColor = vec4(videoColor.rgb, a);
        }else{
            gl_FragColor = vec4(0,0,0,0);
        }
    }
  `,
            transparent: true,
            depthWrite: false,
            alphaTest: 0.5
        });
        const psGeo = new THREE.BufferGeometry()
        const vertices = []
        const sizes = []

        for (let i = 0; i < particleNum; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.sqrt(Math.random()) * spawnRadius;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

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

        vidParticle = { psMat, psGeo, vertices, sizes, originalVertices, particles }
    }

    function InitNonVidParticles(timestamp) {
        time = timestamp / 1000
        const psMat = new THREE.ShaderMaterial({
            uniforms: { prog: { value: 0 } },
            vertexShader: `
    attribute float size;
    attribute float a;
    uniform float prog;
    varying float alpha;
    varying vec4 vScreenPosition;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size;
      gl_Position = projectionMatrix * mvPosition;
      vScreenPosition = gl_Position;
      alpha = a * prog;
    }
  `, fragmentShader: `
    varying float alpha;
    varying vec3 color;
    varying vec4 vScreenPosition;
    void main() {
        vec2 screenUV = vScreenPosition.xy / vScreenPosition.w * 0.5 + 0.5;
        float x =  gl_PointCoord.x -0.5;
        float y =  gl_PointCoord.y -0.5;
       
        if (x * x +y* y < 0.25){
            gl_FragColor = vec4(1,1,1,alpha);
        }else{
            gl_FragColor = vec4(0,0,0,0);
        }
    }
  `,
            transparent: true,
            depthWrite: false,
            alphaTest: 0.5
        });

        const psGeo = new THREE.BufferGeometry()
        const originalVertices = []
        const sizes = []
        const alpha = []

        for (let i = 0; i < bgParticleConfig.num; i++) {
            const angle = Math.random() * 2 * Math.PI
            let radius = Math.sqrt(Math.random()) * spawnRadius

            if (radius > spawnRadius * 0.9)
                radius = spawnRadius * 0.9;

            //move a little to edge
            const x = radius * Math.cos(angle)
            const y = radius * Math.sin(angle)
            const z = radius * Math.sin(angle)

            originalVertices.push(x)
            originalVertices.push(y)
            originalVertices.push(z)

            sizes.push(particleSizeBase - 3 + Math.round(Math.random() * 2 * particleSizeAlter))
            const a = Math.random()
            // limit a to 0.2, 0.4, 0.6,0.7,1
            if (a < 0.1) {
                alpha.push(0.2)
            } else if (a < 0.3) {
                alpha.push(0.4)
            } else if (a < 0.7) {
                alpha.push(0.5)
            } else if (a < 0.95) {
                alpha.push(0.6)
            } else {
                alpha.push(1.0)
            }
        }

        psGeo.setAttribute('position', new THREE.Float32BufferAttribute(originalVertices, 3))
        psGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
        psGeo.setAttribute('a', new THREE.Float32BufferAttribute(alpha, 1))

        const particles = new THREE.Points(psGeo, psMat)
        particleScene.add(particles)

        bgParticle = { psMat, psGeo, originalVertices, sizes, particles }

        particles.position.z = 0
        particles.scale.set(2.1, 2.1, 2.1)

        let steplength = 0.05
        const anim = setInterval(() => {
            particles.position.z -= steplength
            steplength -= 0.0001
            if (steplength < 0.005) steplength = 0.005
            if (particles.position.z <= -8) {
                particles.position.z = -8
                clearInterval(anim)
            }
        }, 10)
    }

    function updateVidParticles(timestamp) {
        time = timestamp / 1000
        const { psGeo, originalVertices } = vidParticle
        const vertices = psGeo.attributes.position.array
        const prog = vidParticleConfig.progress
        const { sampleScalar, timeScalar, amplitude } = vidParticleConfig
        for (let i = 0; i < vertices.length; i += 3) {
            const x = originalVertices[i] * (vidParticleConfig.spreadBase + prog * vidParticleConfig.spreadAlter)
            const y = originalVertices[i + 1] * (vidParticleConfig.spreadBase + prog * vidParticleConfig.spreadAlter) + (-prog * prog + 1.6 * prog - 0.6)
            const z = originalVertices[i + 2] * (vidParticleConfig.spreadBase + prog * vidParticleConfig.spreadAlter)

            const moderatedAmplitude = amplitude * prog
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
        const t = timestamp / 1000
        const { psGeo, originalVertices } = bgParticle
        const { sampleScalar, timeScalar, amplitude } = bgParticleConfig
        const vertices = psGeo.attributes.position.array
        const prog = bgParticleConfig.progress
        // const z = -17 * prog + 10
        for (let i = 0; i < originalVertices.length; i += 3) {
            const x = originalVertices[i]
            const y = originalVertices[i + 1]

            const moderatedAmplitude = amplitude * 5
            const noiseX = noise(sampleScalar * x, sampleScalar * y, t * timeScalar) * moderatedAmplitude
            const noiseY = noise(sampleScalar * x + t * timeScalar, sampleScalar * y, 0) * moderatedAmplitude
            // const noiseZ = noise(sampleScalar * x, sampleScalar * y + t * timeScalar, sampleScalar * z) * moderatedAmplitude

            vertices[i] = x + noiseX
            vertices[i + 1] = y + noiseY
            vertices[i + 2] = -0.1
        }

        psGeo.attributes.position.needsUpdate = true
    }

    function StartThree() {
        InitScene()
        InitVideoAndTextures()
        InitVidParticles()
        InitNonVidParticles()

        StartBgTween()

        // StartVidTween()

        function render(timestamp) {
            requestAnimationFrame(render)
            group.update(timestamp)

            updateVidParticles(timestamp)
            updateNonVidParticles(timestamp)
            renderer.setRenderTarget(renderTarget)
            renderer.render(videoScene, camera)

            renderer.setRenderTarget(null)
            renderer.clear()
            renderer.render(particleScene, camera)
        }

        render(0)
    }

    let bgTween = null

    function StartBgTween() {
        bgTween = new TWEEN.Tween(bgParticleConfig, group)
            .to({ progress: 1 }, 5000)
            .onUpdate((p) => {
                bgParticle.psMat.uniforms.prog.value = p.progress
            })
            .start()
    }

    const texts = [
        "High-quality data can only come from real people,\nand real human effort will always have true value.",
        "PrismaX envisions a world where AI achieves human-level comprehension of the real world,\nrecognizing the invaluable role of human effort in this endeavor.",
        "This is PrismaX,\nA Base Layer for Real-World Multimodal GenAI Apps"
    ]

    function StartVidTween() {
        const emergeTweens = []
        const dismissTweens = []

        bgTween.stop()

        for (let i = 0; i < videoUrls.length; i++) {
            const _i = i;
            const emerge = new TWEEN.Tween(vidParticleConfig, group)
                .to({ progress: 1 }, 1500)
                .onUpdate((param) => {
                    vidParticle.psMat.uniforms.spreadProgress.value = param.progress
                    let pro = param.progress;

                    bgParticle.psMat.uniforms.prog.value = 1 - pro
                    //set position z to progress
                    //limit 0 to 1
                    if (pro < 0) pro = 0
                    if (pro > 1) pro = 1
                    bgParticle.particles.position.z = 6 * pro - 8
                })
                .easing(TWEEN.Easing.Back.In)
                .onStart(() => { 
                    setText('')

                    setTimeout(() => {
                        setText(texts[_i])
                    }, 1000)
                })
            emergeTweens.push(emerge)

            const dismiss = new TWEEN.Tween(vidParticleConfig, group)
                .to({ progress: 0 }, 1200)
                .delay(5000)
                .onUpdate((param) => {
                    vidParticle.psMat.uniforms.spreadProgress.value = param.progress
                    let pro = param.progress;

                    bgParticle.psMat.uniforms.prog.value = 1 - pro
                    //set position z to progress
                    //limit 0 to 1
                    if (pro < 0) pro = 0
                    if (pro > 1) pro = 1
                    bgParticle.particles.position.z = 6 * pro - 8
                })
                .easing(TWEEN.Easing.Back.Out)
                .onComplete(() => {
                    const index = (i + 1) % videoUrls.length
                    videoMaterial.map = videoTextures[index]
                    videoElements[i].pause()
                    videoElements[i].currentTime = 0

                    videoElements[index].currentTime = 0
                    videoElements[index].play()

                    if (i === videoUrls.length - 1) {
                        // todo send out complete event
                        setCompleted(true)
                        //change html overflow to visible
                        document.documentElement.style.overflow = 'visible'
                    }
                }).onStart(() => {
                    setText('')
                })
            dismissTweens.push(dismiss)
        }

        emergeTweens[0].chain(dismissTweens[0])
        dismissTweens[0].chain(emergeTweens[1])
        emergeTweens[1].chain(dismissTweens[1])
        dismissTweens[1].chain(emergeTweens[2])
        emergeTweens[2].chain(dismissTweens[2])
        dismissTweens[2].chain(emergeTweens[0])

        emergeTweens[0].start()
        videoElements[0].play()
    }

    React.useEffect(() => {
        StartThree()
    }, [])

    const [text, setText] = React.useState('')

    async function play() {
        setButtonText('REPLAY')
    }

    React.useEffect(() => {
        if (playing) {
            play()
        }
    }, [playing])

    return (<>
        <div style={{ width: '100%', height: 'calc(100vh - 60pt)' }}>
            <div
                id='three1'
                style={{ backgroundColor: 'transparent', width: '100%', height: '70%', position: 'absolute' }}
            ></div>
            <div style={{ position: 'absolute', bottom: '80pt', margin: '0pt 40pt', zIndex: 1 }}>
                <AnimText text={text} />
                <p className="animponly" style={{
                    display: playing ? 'none' : 'block',
                }}>
                    {"How Can We Help AI See the World?".split("").map((char, index) => (
                        <span className="animspanonly"
                            key={Math.random()}
                            style={{ animationDelay: `${index * 0.02}s` }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                </p>
            </div>
            <div style={{
                display: playing ? 'none' : 'block',
                position: 'absolute',
                bottom: '40pt',
                width: '100%',
                height: '20pt',
                backgroundColor: 'black',
                color: 'white',
                textAlign: 'center',
                zIndex: 2
            }}>
                <button onClick={() => {
                    StartVidTween()
                    setPlaying(true)
                }}>{buttonText}</button>
            </div>

            <div style={{
                display: completed ? 'block' : 'none',
                position: 'absolute',
                bottom: '40pt',
                width: '100%',
                height: '20pt',
                backgroundColor: 'black',
                color: 'white',
                textAlign: 'right',
                zIndex: 2,
                paddingRight: '40pt'
            }}>
                <button onClick={() => {
                    //scroll window height animated
                    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
                }}>Scroll Down</button>
            </div>
        </div>
    </>)
}