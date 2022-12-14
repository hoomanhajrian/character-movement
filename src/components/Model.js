import * as THREE from "three"
import React, { useEffect, useRef, useState } from "react"
import { useThree, useLoader, useFrame } from "@react-three/fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { getMouseDegrees } from "./utils/utils";


function moveJoint(mouse, joint, degreeLimit = 40) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
    joint.rotation.xD = THREE.MathUtils.lerp(joint.rotation.xD || 0, degrees.y, 0.1)
    joint.rotation.yD = THREE.MathUtils.lerp(joint.rotation.yD || 0, degrees.x, 0.1)
    joint.rotation.x = THREE.MathUtils.degToRad(joint.rotation.xD)
    joint.rotation.y = THREE.MathUtils.degToRad(joint.rotation.yD)
}

const Model = ({ mouse, ...props }) => {

    const group = useRef()
    const { nodes, animations } = useLoader(GLTFLoader, "/stacy.glb")
    const texture = useLoader(THREE.TextureLoader, "/stacy.jpg")
    const actions = useRef()
    const [mixer] = useState(() => new THREE.AnimationMixer())
    useFrame((state, delta) => mixer.update(delta))
    useEffect(() => {
        actions.current = { idle: mixer.clipAction(animations[8], group.current) }
        actions.current.idle.play()
        return () => animations.forEach((clip) => mixer.uncacheClip(clip))
    }, [])

    const { size } = useThree()
    useFrame((state, delta) => {
        const mouse = { x: size.width / 2 + (state.mouse.x * size.width) / 2, y: size.height / 2 + (-state.mouse.y * size.height) / 2 }
        mixer.update(delta)
        moveJoint(mouse, nodes.mixamorigNeck)
        moveJoint(mouse, nodes.mixamorigSpine)
    })

    return (
        <group ref={group} {...props} dispose={null}>
            <group rotation={[Math.PI / 2, 0, 0]}>
                <primitive object={nodes["mixamorigHips"]} />
                <skinnedMesh receiveShadow castShadow geometry={nodes["stacy"].geometry} skeleton={nodes["stacy"].skeleton}>
                    <meshStandardMaterial map={texture} map-flipY={false} skinning />
                </skinnedMesh>
            </group>
        </group>
    )

};

export default Model;