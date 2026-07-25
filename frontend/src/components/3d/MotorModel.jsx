import React, { useMemo, useRef } from 'react';
import { useGLTF, Center, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motorComponentsData } from '../../data/mockData';

export default function MotorModel({ 
  viewMode = 'CAD', 
  selectedComponent, 
  setSelectedComponent,
}) {
  const { scene } = useGLTF('/models/motor.glb');
  const groupRef = useRef(null);

  // Map sub-meshes to components
  const componentMap = useMemo(() => {
    const map = new Map();
    const meshes = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });

    meshes.forEach((mesh, index) => {
      const compIndex = index % motorComponentsData.length;
      const comp = motorComponentsData[compIndex];
      map.set(mesh.uuid, comp.id);
    });

    return map;
  }, [scene]);

  // Clone scene with materials configured for clean realistic rendering
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    let meshIndex = 0;

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const compId = componentMap.get(child.uuid) || 
                       motorComponentsData[meshIndex % motorComponentsData.length].id;
        meshIndex++;

        child.userData = { compId };

        if (child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
        }
      }
    });

    return cloned;
  }, [scene, componentMap]);

  // Dynamic animation and component highlighting
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    let meshIdx = 0;
    groupRef.current.traverse((child) => {
      if (child.isMesh) {
        const compId = child.userData.compId || motorComponentsData[meshIdx % motorComponentsData.length].id;
        meshIdx++;

        const comp = motorComponentsData.find((c) => c.id === compId);
        if (!comp) return;

        const isSelected = selectedComponent?.id === compId;

        // Exploded view positioning
        if (viewMode === 'EXPLODED' && comp.explodedOffset) {
          child.position.x = THREE.MathUtils.lerp(child.position.x, comp.explodedOffset[0], delta * 4);
          child.position.y = THREE.MathUtils.lerp(child.position.y, comp.explodedOffset[1], delta * 4);
          child.position.z = THREE.MathUtils.lerp(child.position.z, comp.explodedOffset[2], delta * 4);
        } else {
          child.position.x = THREE.MathUtils.lerp(child.position.x, 0, delta * 4);
          child.position.y = THREE.MathUtils.lerp(child.position.y, 0, delta * 4);
          child.position.z = THREE.MathUtils.lerp(child.position.z, 0, delta * 4);
        }

        // Selection Highlighting: Selected part turns vibrant blue; non-selected fade to 30% opacity
        if (selectedComponent) {
          if (isSelected) {
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 1.0, delta * 8);
            child.material.color.set('#2563eb'); // Blue highlight for selected part
          } else {
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 0.3, delta * 8);
          }
        } else {
          // Default clean realistic state
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 1.0, delta * 8);
          if (viewMode === 'THERMAL') {
            const tempColor = comp.temperature > 75 ? '#ef4444' : comp.temperature > 65 ? '#f59e0b' : '#3b82f6';
            child.material.color.set(tempColor);
          } else if (viewMode === 'VIBRATION') {
            const vibColor = comp.vibration > 4.0 ? '#ef4444' : comp.vibration > 2.0 ? '#f59e0b' : '#10b981';
            child.material.color.set(vibColor);
          }
        }
      }
    });
  });

  // Click on 3D motor mesh selects that part
  const handleClick = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh && mesh.userData && mesh.userData.compId) {
      const comp = motorComponentsData.find((c) => c.id === mesh.userData.compId);
      if (comp) {
        setSelectedComponent(comp);
      }
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      <Center top>
        <primitive object={clonedScene} scale={1} />
      </Center>

      {/* Render pin marker ONLY for the currently selected component */}
      {selectedComponent && selectedComponent.position3d && (
        <Html
          position={selectedComponent.position3d}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white border border-white text-[10px] font-mono font-bold shadow-lg animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{selectedComponent.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/models/motor.glb');
