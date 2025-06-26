import { useState } from "react";
import { Sphere, Text } from '@react-three/drei'

export function Node() {
    return (<>
        <Sphere position={[0, 0.25, -1]} castShadow receiveShadow>
            <meshStandardMaterial color="#f25f5c" roughness={0.5} metalness={0.2} />
        </Sphere>
        <Text
            position={[0, 0.6, -1]}
            fontSize={0.1}
            anchorX="center"
            anchorY="middle"
            color="#1a237e"
            receiveShadow
        >
            Node 1
        </Text>
    </>)
}