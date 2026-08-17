import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { campusBuildings } from '../../../data/plantAssetsData';

// ─── Reusable structural steel column ──────────────────────────────────────
function SteelColumn({ x, z, h, color = '#4B5965' }) {
  return (
    <mesh position={[x, h / 2, z]} castShadow>
      <boxGeometry args={[0.35, h, 0.35]} />
      <meshStandardMaterial color={color} metalness={0.75} roughness={0.3} />
    </mesh>
  );
}

// ─── Roof vent cylinder ────────────────────────────────────────────────────
function RoofVent({ x, z, baseY }) {
  return (
    <group position={[x, baseY, z]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.35, 0.9, 12]} />
        <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.28, 0.22, 12]} />
        <meshStandardMaterial color="#26343F" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  );
}

// ─── HVAC unit ────────────────────────────────────────────────────────────
function HvacUnit({ x, z, baseY }) {
  return (
    <group position={[x, baseY + 0.5, z]}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 1.0, 1.6]} />
        <meshStandardMaterial color="#4B5965" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial color="#26343F" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ─── Loading bay door ──────────────────────────────────────────────────────
function LoadingDoor({ x, y, z, w = 4.0, h = 4.2, facingZ = true, color = '#4B5965' }) {
  const normal = facingZ ? [0, 0, 0.06] : [0.06, 0, 0];
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, facingZ ? normal[2] : 0]} castShadow>
        <boxGeometry args={facingZ ? [w, h, 0.12] : [0.12, h, w]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, facingZ ? normal[2] + 0.07 : 0]} castShadow>
        <boxGeometry args={facingZ ? [w + 0.3, h + 0.3, 0.08] : [0.08, h + 0.3, w + 0.3]} />
        <meshStandardMaterial color="#26343F" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Decorative wall pilaster strip ───────────────────────────────────────
function WallPilaster({ x, z, h, color = '#C2CDD4' }) {
  return (
    <mesh position={[x, h / 2, z]} castShadow>
      <boxGeometry args={[0.28, h, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

// ─── Tree (varied) ────────────────────────────────────────────────────────
function Tree({ x, z, scale = 1, variety = 0 }) {
  const foliageColors = ['#2D6A4F', '#3A7A5C', '#266048', '#3D8860', '#1F5E40'];
  const fc = foliageColors[variety % foliageColors.length];
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.8 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.25 * scale, 0.36 * scale, 3.5 * scale, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.5 * scale, 0]} castShadow>
        <sphereGeometry args={[2.0 * scale, 10, 10]} />
        <meshStandardMaterial color={fc} roughness={0.82} />
      </mesh>
      {scale > 0.6 && (
        <mesh position={[0, 3.4 * scale, 0]} castShadow>
          <sphereGeometry args={[1.4 * scale, 8, 8]} />
          <meshStandardMaterial color={foliageColors[(variety + 1) % foliageColors.length]} roughness={0.82} />
        </mesh>
      )}
    </group>
  );
}

// ─── Shrub cluster ────────────────────────────────────────────────────────
function Shrubs({ x, z, count = 3 }) {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      dx: (i - count / 2) * 1.4,
      dz: Math.sin(i * 2.3) * 0.6,
      r: 0.55 + Math.cos(i * 1.7) * 0.2,
    }));
  }, [count]);
  return (
    <group position={[x, 0, z]}>
      {items.map((sh, i) => (
        <mesh key={i} position={[sh.dx, sh.r * 0.6, sh.dz]} castShadow>
          <sphereGeometry args={[sh.r, 8, 6]} />
          <meshStandardMaterial color="#3D6B52" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Exhaust stack ────────────────────────────────────────────────────────
function ExhaustStack({ x, z, h = 8, r = 0.35 }) {
  return (
    <mesh position={[x, h / 2, z]} castShadow>
      <cylinderGeometry args={[r * 0.85, r, h, 14]} />
      <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
    </mesh>
  );
}

// ─── Street Light ─────────────────────────────────────────────────────────
function StreetLight({ x, z, rotY = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
        <meshStandardMaterial color="#B8C1C8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.072, 10.4, 8]} />
        <meshStandardMaterial color="#4B5965" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0.92, 10.5, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.036, 0.036, 2.0, 6]} />
        <meshStandardMaterial color="#4B5965" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[1.88, 10.25, 0]}>
        <boxGeometry args={[0.62, 0.2, 0.36]} />
        <meshStandardMaterial color="#26343F" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.88, 10.14, 0]}>
        <boxGeometry args={[0.52, 0.04, 0.28]} />
        <meshStandardMaterial color="#FFF8DC" emissive="#FFF5B0" emissiveIntensity={0.45} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ─── Parked Car ───────────────────────────────────────────────────────────
function ParkedCar({ x, z, color = '#2563EB', rotY = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.54, 0]} castShadow>
        <boxGeometry args={[1.88, 0.74, 4.0]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.58} />
      </mesh>
      <mesh position={[0, 1.06, -0.2]} castShadow>
        <boxGeometry args={[1.64, 0.52, 2.18]} />
        <meshStandardMaterial color="#0A0F1A" roughness={0.08} metalness={0.92} />
      </mesh>
      <mesh position={[0, 0.38, 2.05]}>
        <boxGeometry args={[1.72, 0.24, 0.1]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.28} metalness={0.5} />
      </mesh>
    </group>
  );
}

// ─── Semi Truck ───────────────────────────────────────────────────────────
function SemiTruck({ x, z, cabColor = '#1D4ED8', rotY = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.88, 6.4]} castShadow>
        <boxGeometry args={[2.56, 3.35, 3.5]} />
        <meshStandardMaterial color={cabColor} roughness={0.28} metalness={0.42} />
      </mesh>
      <mesh position={[0, 3.72, 5.5]}>
        <boxGeometry args={[2.4, 0.82, 1.65]} />
        <meshStandardMaterial color={cabColor} roughness={0.3} metalness={0.38} />
      </mesh>
      <mesh position={[0, 2.55, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.82, 3.88, 13.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.36} metalness={0.52} />
      </mesh>
      <mesh position={[-1.45, 0.52, 4.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.52, 0.52, 0.32, 14]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>
      <mesh position={[1.45, 0.52, 4.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.52, 0.52, 0.32, 14]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>
    </group>
  );
}

// ─── Box Truck ────────────────────────────────────────────────────────────
function BoxTruck({ x, z, color = '#475569', rotY = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.42, 3.28, 7.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.1, 4.05]} castShadow>
        <boxGeometry args={[2.36, 2.05, 0.85]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

// ─── Forklift ─────────────────────────────────────────────────────────────
function Forklift({ x, z, rotY = 0 }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[1.62, 1.32, 2.85]} />
        <meshStandardMaterial color="#EAB308" roughness={0.32} metalness={0.38} />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <boxGeometry args={[1.22, 0.82, 1.52]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.25, 1.65]} castShadow>
        <boxGeometry args={[0.18, 3.25, 0.18]} />
        <meshStandardMaterial color="#4B5965" metalness={0.7} />
      </mesh>
      <mesh position={[-0.4, 0.3, 2.85]} castShadow>
        <boxGeometry args={[0.1, 0.1, 1.82]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
      <mesh position={[0.4, 0.3, 2.85]} castShadow>
        <boxGeometry args={[0.1, 0.1, 1.82]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
    </group>
  );
}

// ─── Distant Background Building (low detail) ─────────────────────────────
function BgBuilding({ x, z, w, h, d, wallC = '#C5CDD4', roofC = '#4A6070' }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={wallC} roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh position={[0, h + 0.28, 0]}>
        <boxGeometry args={[w + 0.5, 0.55, d + 0.5]} />
        <meshStandardMaterial color={roofC} roughness={0.62} metalness={0.38} />
      </mesh>
    </group>
  );
}

export default function IndustrialCampusEnvironment({
  selectedBuildingId,
  onSelectBuilding,
  viewMode = 'OVERVIEW',
  isCutawayActive = false,
  enteredBuildingId = null,
}) {
  const steamRef = useRef();
  const steam2Ref = useRef();
  const movingTruckRef = useRef();
  const movingCar1Ref = useRef();
  const movingCar2Ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Animated steam puffs (existing — unchanged)
    [steamRef, steam2Ref].forEach((ref, refIdx) => {
      if (ref.current) {
        ref.current.children.forEach((puff, idx) => {
          const phase = t * 1.6 + idx * 1.4 + refIdx * 2.1;
          puff.position.y = 13 + (phase % 5.5);
          puff.scale.setScalar(0.7 + ((phase % 5.5) * 0.28));
          puff.material.opacity = Math.max(0, 0.32 - (((phase % 5.5) / 5.5) * 0.32));
        });
      }
    });

    // Slow perimeter truck (oval path around campus)
    if (movingTruckRef.current) {
      const speed = 0.038;
      const angle = t * speed;
      movingTruckRef.current.position.x = Math.cos(angle) * 98;
      movingTruckRef.current.position.z = Math.sin(angle) * 76;
      movingTruckRef.current.rotation.y = -angle + Math.PI * 0.5;
    }

    // Car 1 – south entrance road, slow northbound
    if (movingCar1Ref.current) {
      const cycle = (t * 0.05) % 1.0;
      movingCar1Ref.current.position.z = 112 - cycle * 90;
      movingCar1Ref.current.position.x = -4;
    }

    // Car 2 – west perimeter road, slow
    if (movingCar2Ref.current) {
      const cycle2 = (t * 0.04 + 0.5) % 1.0;
      movingCar2Ref.current.position.x = -120 + cycle2 * 240;
      movingCar2Ref.current.position.z = -112;
    }
  });

  return (
    <group>

      {/* ================================================================ */}
      {/* A. OUTER TERRAIN BASE — Multi-zone realistic ground               */}
      {/* ================================================================ */}

      {/* Far terrain: natural earth outside campus boundary */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[420, 380]} />
        <meshStandardMaterial color="#5A6642" roughness={0.94} metalness={0.0} />
      </mesh>

      {/* Primary site asphalt base (within campus boundary) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <planeGeometry args={[256, 234]} />
        <meshStandardMaterial color="#343B43" roughness={0.91} metalness={0.05} />
      </mesh>

      {/* Slight asphalt tone variation (natural aging) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -0.02, 4]} receiveShadow>
        <planeGeometry args={[160, 140]} />
        <meshStandardMaterial color="#38404A" roughness={0.89} metalness={0.04} />
      </mesh>

      {/* Concrete zone around factory core (inner yard) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, -2]} receiveShadow>
        <planeGeometry args={[125, 96]} />
        <meshStandardMaterial color="#AEBAC0" roughness={0.87} metalness={0.03} />
      </mesh>

      {/* ================================================================ */}
      {/* B. BUILDING PADS — Light concrete apron around each building     */}
      {/* ================================================================ */}
      {campusBuildings.map((bld) => {
        const [w, , d] = bld.dimensions;
        const [x, , z] = bld.position;
        return (
          <mesh key={`pad-${bld.id}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]} receiveShadow>
            <planeGeometry args={[w + 6, d + 6]} />
            <meshStandardMaterial color="#B8C1C8" roughness={0.85} metalness={0.04} />
          </mesh>
        );
      })}

      {/* ================================================================ */}
      {/* C. MAIN ENTRANCE ROAD — Wide dual carriageway from south          */}
      {/* ================================================================ */}

      {/* Main road surface – wide 4-lane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 86]} receiveShadow>
        <planeGeometry args={[28, 56]} />
        <meshStandardMaterial color="#252C34" roughness={0.91} metalness={0.07} />
      </mesh>
      {/* Road surface continues toward gate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 60]} receiveShadow>
        <planeGeometry args={[28, 12]} />
        <meshStandardMaterial color="#252C34" roughness={0.91} metalness={0.07} />
      </mesh>
      {/* Median green strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 86]}>
        <planeGeometry args={[2.0, 56]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.94} />
      </mesh>
      {/* Raised kerbs / sidewalks alongside entrance road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, 0.025, 86]} receiveShadow>
        <planeGeometry args={[3.0, 56]} />
        <meshStandardMaterial color="#A8B4BA" roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.025, 86]} receiveShadow>
        <planeGeometry args={[3.0, 56]} />
        <meshStandardMaterial color="#A8B4BA" roughness={0.88} metalness={0.04} />
      </mesh>

      {/* ================================================================ */}
      {/* D. INTERNAL CAMPUS ROAD NETWORK                                   */}
      {/* ================================================================ */}

      {/* N-S spine road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[14, 230]} />
        <meshStandardMaterial color="#2A3038" roughness={0.88} metalness={0.08} />
      </mesh>

      {/* E-W north cross boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -16]} receiveShadow>
        <planeGeometry args={[230, 12]} />
        <meshStandardMaterial color="#2A3038" roughness={0.88} metalness={0.08} />
      </mesh>

      {/* E-W south cross boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 20]} receiveShadow>
        <planeGeometry args={[230, 12]} />
        <meshStandardMaterial color="#2A3038" roughness={0.88} metalness={0.08} />
      </mesh>

      {/* West access road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-62, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 140]} />
        <meshStandardMaterial color="#2A3038" roughness={0.88} metalness={0.08} />
      </mesh>

      {/* East access road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[62, 0.02, 0]} receiveShadow>
        <planeGeometry args={[10, 140]} />
        <meshStandardMaterial color="#2A3038" roughness={0.88} metalness={0.08} />
      </mesh>

      {/* South logistics road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.02, 46]} receiveShadow>
        <planeGeometry args={[44, 10]} />
        <meshStandardMaterial color="#2A3038" roughness={0.88} metalness={0.08} />
      </mesh>

      {/* ================================================================ */}
      {/* E. PERIMETER LOOP ROAD                                           */}
      {/* ================================================================ */}

      {/* North perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -62]} receiveShadow>
        <planeGeometry args={[172, 9]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>
      {/* West perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-83, 0.02, -8]} receiveShadow>
        <planeGeometry args={[9, 130]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>
      {/* East perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[79, 0.02, -8]} receiveShadow>
        <planeGeometry args={[9, 130]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>
      {/* South-west perimeter (flanking entrance) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-52, 0.02, 60]} receiveShadow>
        <planeGeometry args={[62, 9]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>
      {/* South-east perimeter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[52, 0.02, 60]} receiveShadow>
        <planeGeometry args={[62, 9]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>

      {/* Employee parking access lane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-92, 0.02, 5]} receiveShadow>
        <planeGeometry args={[9, 68]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>

      {/* Truck staging access */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[85, 0.02, 25]} receiveShadow>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[89, 0.02, 14]} receiveShadow>
        <planeGeometry args={[9, 30]} />
        <meshStandardMaterial color="#252C34" roughness={0.9} metalness={0.07} />
      </mesh>

      {/* ================================================================ */}
      {/* F. PARKING LOTS                                                  */}
      {/* ================================================================ */}

      {/* Employee parking — west side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-99, 0.015, 6]} receiveShadow>
        <planeGeometry args={[24, 32]} />
        <meshStandardMaterial color="#2E3540" roughness={0.93} metalness={0.05} />
      </mesh>

      {/* Visitor parking — south front */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 70]} receiveShadow>
        <planeGeometry args={[32, 9]} />
        <meshStandardMaterial color="#2E3540" roughness={0.93} metalness={0.05} />
      </mesh>

      {/* Truck staging area — east */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[88, 0.015, 28]} receiveShadow>
        <planeGeometry args={[22, 42]} />
        <meshStandardMaterial color="#2A3038" roughness={0.91} metalness={0.06} />
      </mesh>

      {/* ================================================================ */}
      {/* G. ROAD MARKINGS — Lanes, crossings, safety, parking lines       */}
      {/* ================================================================ */}
      <group position={[0, 0.045, 0]}>

        {/* Main entrance road: centre lane dashes */}
        {[62, 70, 78, 86, 94, 102, 110].map((z, i) => (
          <React.Fragment key={`mr-${i}`}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.8, 0, z]}>
              <planeGeometry args={[0.2, 8]} />
              <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.8, 0, z]}>
              <planeGeometry args={[0.2, 8]} />
              <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
            </mesh>
          </React.Fragment>
        ))}
        {/* Stop line at security gate */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 58]}>
          <planeGeometry args={[26, 0.45]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Entrance pedestrian crosswalk stripes */}
        {[-10, -7, -4, -1, 2, 5, 8].map((x, i) => (
          <mesh key={`ecw-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, 55]}>
            <planeGeometry args={[2.0, 0.72]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.9} transparent />
          </mesh>
        ))}

        {/* N-S spine: double amber centre dashes */}
        {[-88, -74, -60, -46, -32, -18, -4, 10, 24, 38, 52, 66, 80].map((z, i) => (
          <React.Fragment key={`yd-${i}`}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.32, 0, z]}>
              <planeGeometry args={[0.18, 8]} />
              <meshBasicMaterial color="#F59E0B" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.32, 0, z]}>
              <planeGeometry args={[0.18, 8]} />
              <meshBasicMaterial color="#F59E0B" />
            </mesh>
          </React.Fragment>
        ))}

        {/* North boulevard centre dashes */}
        {[-95, -78, -58, -38, -20, 0, 20, 38, 58, 78, 95].map((x, i) => (
          <mesh key={`bn-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, -16]}>
            <planeGeometry args={[8, 0.18]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
          </mesh>
        ))}
        {/* South boulevard centre dashes */}
        {[-95, -78, -58, -38, -20, 0, 20, 38, 58, 78, 95].map((x, i) => (
          <mesh key={`bs-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, 20]}>
            <planeGeometry args={[8, 0.18]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
          </mesh>
        ))}

        {/* Crosswalks at N-S / E-W junction */}
        {[-4, -2, 0, 2, 4].map((x, i) => (
          <React.Fragment key={`cw-${i}`}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, -9]}>
              <planeGeometry args={[0.75, 3.5]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, 13]}>
              <planeGeometry args={[0.75, 3.5]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </React.Fragment>
        ))}

        {/* Loading zone yellow marks – warehouse */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-46, 0, 32]}>
          <planeGeometry args={[12, 5]} />
          <meshBasicMaterial color="#F59E0B" opacity={0.22} transparent />
        </mesh>
        {/* Loading zone yellow – logistics */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0, 47]}>
          <planeGeometry args={[24, 5]} />
          <meshBasicMaterial color="#F59E0B" opacity={0.22} transparent />
        </mesh>

        {/* Employee parking lines — row 1 */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={`pke1-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-88 + i * 2.1, 0, -2]}>
            <planeGeometry args={[0.1, 5.2]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
          </mesh>
        ))}
        {/* Row 2 */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={`pke2-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-88 + i * 2.1, 0, 8]}>
            <planeGeometry args={[0.1, 5.2]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
          </mesh>
        ))}
        {/* Row 3 */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={`pke3-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-88 + i * 2.1, 0, 18]}>
            <planeGeometry args={[0.1, 5.2]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
          </mesh>
        ))}
        {/* Parking row boundary lines */}
        {[-4.5, 3, 13, 21].map((z, i) => (
          <mesh key={`pkrow-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-99, 0, z]}>
            <planeGeometry args={[24, 0.14]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.45} transparent />
          </mesh>
        ))}

        {/* Visitor parking lines */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={`pkv-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-14 + i * 4.0, 0, 70]}>
            <planeGeometry args={[0.12, 5.5]} />
            <meshBasicMaterial color="#FFFFFF" opacity={0.65} transparent />
          </mesh>
        ))}

        {/* AGV path – cyan dashes (factory floor) */}
        {[-8, -4, 0, 4, 8].map((z, i) => (
          <mesh key={`agv-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]}>
            <planeGeometry args={[0.12, 6]} />
            <meshBasicMaterial color="#00C8FF" opacity={0.32} transparent />
          </mesh>
        ))}

        {/* Speed bump warnings on internal roads */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0, 5]}>
          <planeGeometry args={[13, 0.6]} />
          <meshBasicMaterial color="#EAB308" opacity={0.8} transparent />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0, -8]}>
          <planeGeometry args={[13, 0.6]} />
          <meshBasicMaterial color="#EAB308" opacity={0.8} transparent />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* H. REALISTIC LANDSCAPING — Irregular, natural grass shapes       */}
      {/* ================================================================ */}

      {/* Northwest corner natural grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-90, 0.005, -72]} receiveShadow>
        <planeGeometry args={[52, 40]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-76, 0.006, -60]} receiveShadow>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial color="#508F62" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-106, 0.005, -54]} receiveShadow>
        <planeGeometry args={[20, 18]} />
        <meshStandardMaterial color="#4C8C5E" roughness={0.93} />
      </mesh>

      {/* Northeast corner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[90, 0.005, -70]} receiveShadow>
        <planeGeometry args={[48, 38]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[78, 0.006, -62]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#528F63" roughness={0.94} />
      </mesh>

      {/* Southwest corner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-92, 0.005, 72]} receiveShadow>
        <planeGeometry args={[38, 30]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-74, 0.005, 78]} receiveShadow>
        <planeGeometry args={[24, 22]} />
        <meshStandardMaterial color="#4D8C5E" roughness={0.94} />
      </mesh>

      {/* Southeast corner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[92, 0.005, 72]} receiveShadow>
        <planeGeometry args={[36, 28]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.93} />
      </mesh>

      {/* North perimeter grass belt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -85]} receiveShadow>
        <planeGeometry args={[168, 28]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.006, -72]} receiveShadow>
        <planeGeometry args={[90, 14]} />
        <meshStandardMaterial color="#508F62" roughness={0.94} />
      </mesh>

      {/* South perimeter (flanking main entrance road) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-48, 0.005, 78]} receiveShadow>
        <planeGeometry args={[56, 28]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.93} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[52, 0.005, 80]} receiveShadow>
        <planeGeometry args={[52, 26]} />
        <meshStandardMaterial color="#4E8E60" roughness={0.94} />
      </mesh>

      {/* HQ front garden — irregular shape */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-42, 0.005, -46]} receiveShadow>
        <planeGeometry args={[28, 14]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-42, 0.005, -54]} receiveShadow>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial color="#56986A" roughness={0.92} />
      </mesh>

      {/* Road verge strips (inner campus) */}
      {[-54, -46, -38].map((x, i) => (
        <mesh key={`rv-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, -6]} receiveShadow>
          <planeGeometry args={[5, 12]} />
          <meshStandardMaterial color="#508F62" roughness={0.93} />
        </mesh>
      ))}

      {/* Entrance median garden circles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, 0.005, 54]} receiveShadow>
        <circleGeometry args={[3.8, 18]} />
        <meshStandardMaterial color="#56986A" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, 0.005, 54]} receiveShadow>
        <circleGeometry args={[3.8, 18]} />
        <meshStandardMaterial color="#56986A" roughness={0.92} />
      </mesh>

      {/* Main entrance road median (grass centre) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 82]}>
        <planeGeometry args={[1.8, 52]} />
        <meshStandardMaterial color="#4F8F61" roughness={0.94} />
      </mesh>

      {/* ================================================================ */}
      {/* I. TREES — Varied, natural placement                             */}
      {/* ================================================================ */}
      <group>
        {/* Main entrance boulevard (both sides of road) */}
        {[62, 69, 76, 83, 90, 97, 104].map((z, i) => (
          <React.Fragment key={`ent-${i}`}>
            <Tree x={-18.5} z={z} scale={0.88} variety={i % 5} />
            <Tree x={18.5} z={z} scale={0.88} variety={(i + 2) % 5} />
          </React.Fragment>
        ))}

        {/* Perimeter belt — west */}
        {[-85, -72, -58, -44, -30, -16, -2, 12, 26, 40, 54, 68].map((z, i) => (
          <Tree key={`pw-${i}`} x={-114} z={z} scale={1.1} variety={i % 5} />
        ))}
        {[-78, -64, -50, -36, -22, -8, 6, 20, 34, 48, 62].map((z, i) => (
          <Tree key={`pw2-${i}`} x={-106} z={z} scale={0.9} variety={(i + 2) % 5} />
        ))}

        {/* Perimeter belt — east */}
        {[-80, -66, -52, -38, -24, -10, 4, 18, 32, 46, 60].map((z, i) => (
          <Tree key={`pe-${i}`} x={110} z={z} scale={1.0} variety={(i + 1) % 5} />
        ))}

        {/* Perimeter belt — north */}
        {[-90, -70, -48, -24, 0, 24, 48, 70, 90].map((x, i) => (
          <Tree key={`pn-${i}`} x={x} z={-104} scale={1.0} variety={i % 5} />
        ))}
        {[-80, -56, -32, -8, 16, 42, 68].map((x, i) => (
          <Tree key={`pn2-${i}`} x={x} z={-94} scale={0.82} variety={(i + 3) % 5} />
        ))}

        {/* South perimeter (flanking entrance) */}
        {[-78, -62, -50, 50, 62, 78].map((x, i) => (
          <Tree key={`ps-${i}`} x={x} z={98} scale={0.92} variety={i % 5} />
        ))}

        {/* HQ entrance garden trees */}
        {[-50, -46, -42, -38, -34].map((x, i) => (
          <Tree key={`thq-${i}`} x={x} z={-46} scale={0.74} variety={i % 5} />
        ))}
        {[-48, -44, -40, -36].map((x, i) => (
          <Tree key={`thq2-${i}`} x={x} z={-53} scale={0.65} variety={(i + 1) % 5} />
        ))}

        {/* Employee parking lot trees / islands */}
        <Tree x={-99} z={-4} scale={0.72} variety={0} />
        <Tree x={-99} z={4} scale={0.76} variety={2} />
        <Tree x={-99} z={12} scale={0.70} variety={4} />
        <Tree x={-99} z={20} scale={0.74} variety={1} />

        {/* Spine road verge trees */}
        {[-68, -48, -28, 32, 52, 72].map((z, i) => (
          <React.Fragment key={`spv-${i}`}>
            <Tree x={-9} z={z} scale={0.68} variety={i % 5} />
            <Tree x={9} z={z} scale={0.68} variety={(i + 2) % 5} />
          </React.Fragment>
        ))}

        {/* NW corner grove */}
        {[[-82, -66], [-87, -72], [-92, -78], [-84, -74], [-90, -68]].map(([tx, tz], i) => (
          <Tree key={`nwg-${i}`} x={tx} z={tz} scale={[0.92, 1.05, 1.0, 0.88, 0.96][i]} variety={i % 5} />
        ))}
        {/* NE corner grove */}
        {[[82, -64], [88, -70], [94, -76], [86, -72], [92, -67]].map(([tx, tz], i) => (
          <Tree key={`neg-${i}`} x={tx} z={tz} scale={[0.9, 1.02, 0.98, 0.87, 0.94][i]} variety={(i + 2) % 5} />
        ))}

        {/* Entrance circle shrubs */}
        <Shrubs x={-12} z={54} count={5} />
        <Shrubs x={12} z={54} count={5} />

        {/* Parking lot shrubs */}
        <Shrubs x={-99} z={0} count={3} />
        <Shrubs x={-99} z={8} count={3} />
        <Shrubs x={-99} z={15} count={3} />
      </group>

      {/* ================================================================ */}
      {/* J. PERIMETER FENCE — Full campus boundary with gate gap          */}
      {/* ================================================================ */}
      <group>
        {/* NORTH fence posts */}
        {Array.from({ length: 30 }, (_, i) => (
          <mesh key={`fn-${i}`} position={[-126 + i * 8.6, 1.58, -112]} castShadow>
            <boxGeometry args={[0.16, 3.16, 0.16]} />
            <meshStandardMaterial color="#4B5965" metalness={0.64} roughness={0.36} />
          </mesh>
        ))}
        <mesh position={[0, 2.68, -112]}>
          <boxGeometry args={[254, 0.1, 0.1]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>
        <mesh position={[0, 1.38, -112]}>
          <boxGeometry args={[254, 0.1, 0.1]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>

        {/* WEST fence posts */}
        {Array.from({ length: 29 }, (_, i) => (
          <mesh key={`fw-${i}`} position={[-126, 1.58, -106 + i * 8.0]} castShadow>
            <boxGeometry args={[0.16, 3.16, 0.16]} />
            <meshStandardMaterial color="#4B5965" metalness={0.64} roughness={0.36} />
          </mesh>
        ))}
        <mesh position={[-126, 2.68, 0]}>
          <boxGeometry args={[0.1, 0.1, 228]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>
        <mesh position={[-126, 1.38, 0]}>
          <boxGeometry args={[0.1, 0.1, 228]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>

        {/* EAST fence posts */}
        {Array.from({ length: 29 }, (_, i) => (
          <mesh key={`fe-${i}`} position={[126, 1.58, -106 + i * 8.0]} castShadow>
            <boxGeometry args={[0.16, 3.16, 0.16]} />
            <meshStandardMaterial color="#4B5965" metalness={0.64} roughness={0.36} />
          </mesh>
        ))}
        <mesh position={[126, 2.68, 0]}>
          <boxGeometry args={[0.1, 0.1, 228]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>
        <mesh position={[126, 1.38, 0]}>
          <boxGeometry args={[0.1, 0.1, 228]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>

        {/* SOUTH fence left wing (up to gate) */}
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`fsl-${i}`} position={[-126 + i * 9.0, 1.58, 112]} castShadow>
            <boxGeometry args={[0.16, 3.16, 0.16]} />
            <meshStandardMaterial color="#4B5965" metalness={0.64} roughness={0.36} />
          </mesh>
        ))}
        <mesh position={[-70, 2.68, 112]}>
          <boxGeometry args={[114, 0.1, 0.1]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>
        <mesh position={[-70, 1.38, 112]}>
          <boxGeometry args={[114, 0.1, 0.1]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>

        {/* SOUTH fence right wing */}
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`fsr-${i}`} position={[26 + i * 9.0, 1.58, 112]} castShadow>
            <boxGeometry args={[0.16, 3.16, 0.16]} />
            <meshStandardMaterial color="#4B5965" metalness={0.64} roughness={0.36} />
          </mesh>
        ))}
        <mesh position={[76, 2.68, 112]}>
          <boxGeometry args={[104, 0.1, 0.1]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>
        <mesh position={[76, 1.38, 112]}>
          <boxGeometry args={[104, 0.1, 0.1]} />
          <meshStandardMaterial color="#4B5965" metalness={0.65} />
        </mesh>
      </group>

      {/* ================================================================ */}
      {/* K. SECURITY GATE & GATEHOUSE                                     */}
      {/* ================================================================ */}
      <group position={[0, 0, 104]}>
        {/* Left gatehouse (visitor) */}
        <mesh position={[-18, 2.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.0, 4.7, 6.0]} />
          <meshStandardMaterial color="#EEF2F4" roughness={0.64} metalness={0.05} />
        </mesh>
        <mesh position={[-18, 5.0, 0]} castShadow>
          <boxGeometry args={[7.2, 0.55, 6.2]} />
          <meshStandardMaterial color="#3E607E" roughness={0.5} metalness={0.44} />
        </mesh>
        {/* Gatehouse front window */}
        <mesh position={[-18, 2.35, 3.1]}>
          <boxGeometry args={[4.0, 1.9, 0.12]} />
          <meshStandardMaterial color="#6E9CB8" roughness={0.08} metalness={0.88} transparent opacity={0.85} />
        </mesh>
        {/* Accent stripe */}
        <mesh position={[-18, 0.95, 3.1]}>
          <boxGeometry args={[7.0, 0.5, 0.08]} />
          <meshStandardMaterial color="#1677E8" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Right gatehouse (employee/staff) */}
        <mesh position={[18, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.0, 4.3, 5.5]} />
          <meshStandardMaterial color="#EEF2F4" roughness={0.64} metalness={0.05} />
        </mesh>
        <mesh position={[18, 4.6, 0]} castShadow>
          <boxGeometry args={[6.2, 0.5, 5.7]} />
          <meshStandardMaterial color="#3E607E" roughness={0.5} metalness={0.44} />
        </mesh>

        {/* GATE: overhead portal structure */}
        <mesh position={[0, 7.2, 0]} castShadow>
          <boxGeometry args={[40, 0.4, 0.6]} />
          <meshStandardMaterial color="#26343F" metalness={0.72} roughness={0.3} />
        </mesh>
        {/* Portal posts */}
        <mesh position={[-20, 3.8, 0]} castShadow>
          <boxGeometry args={[0.4, 7.6, 0.4]} />
          <meshStandardMaterial color="#26343F" metalness={0.72} roughness={0.3} />
        </mesh>
        <mesh position={[20, 3.8, 0]} castShadow>
          <boxGeometry args={[0.4, 7.6, 0.4]} />
          <meshStandardMaterial color="#26343F" metalness={0.72} roughness={0.3} />
        </mesh>

        {/* Company sign on portal */}
        <mesh position={[0, 6.85, 0.35]} castShadow>
          <boxGeometry args={[14, 1.5, 0.22]} />
          <meshStandardMaterial color="#0F2340" roughness={0.3} metalness={0.18} />
        </mesh>
        {/* TWINMIND blue accent strip */}
        <mesh position={[0, 7.65, 0.35]}>
          <boxGeometry args={[14, 0.28, 0.22]} />
          <meshStandardMaterial color="#1677E8" roughness={0.3} metalness={0.3} emissive="#1677E8" emissiveIntensity={0.12} />
        </mesh>

        {/* Left boom barrier (visitor) */}
        <mesh position={[-10.5, 1.3, 0]} castShadow>
          <boxGeometry args={[0.22, 2.6, 0.22]} />
          <meshStandardMaterial color="#26343F" metalness={0.68} />
        </mesh>
        <mesh position={[-6.0, 1.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 9.0, 8]} />
          <meshStandardMaterial color="#DC2626" />
        </mesh>

        {/* Right boom barrier (employee) */}
        <mesh position={[10.5, 1.3, 0]} castShadow>
          <boxGeometry args={[0.22, 2.6, 0.22]} />
          <meshStandardMaterial color="#26343F" metalness={0.68} />
        </mesh>
        <mesh position={[15.5, 1.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 9.0, 8]} />
          <meshStandardMaterial color="#F59E0B" />
        </mesh>

        {/* Gate lane concrete island */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <planeGeometry args={[5.5, 6.0]} />
          <meshStandardMaterial color="#A8B4BA" roughness={0.86} />
        </mesh>

        {/* CCTV poles at gate */}
        {[-9, 9].map((gx, gi) => (
          <group key={`gcam-${gi}`} position={[gx, 0, -4]}>
            <mesh position={[0, 4.5, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.062, 9.0, 8]} />
              <meshStandardMaterial color="#4B5965" metalness={0.7} />
            </mesh>
            <mesh position={[0.45, 8.55, 0]} castShadow>
              <boxGeometry args={[0.65, 0.24, 0.28]} />
              <meshStandardMaterial color="#1e293b" metalness={0.62} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================================================================ */}
      {/* L. STREET LIGHTS — Roads, parking, perimeter                    */}
      {/* ================================================================ */}
      <group>
        {/* Main entrance boulevard (both sides) */}
        {[64, 72, 80, 88, 96, 104].map((z, i) => (
          <React.Fragment key={`sle-${i}`}>
            <StreetLight x={-20} z={z} rotY={Math.PI} />
            <StreetLight x={20} z={z} rotY={0} />
          </React.Fragment>
        ))}

        {/* Internal spine road */}
        {[-72, -52, -32, 32, 52, 72].map((z, i) => (
          <React.Fragment key={`sls-${i}`}>
            <StreetLight x={-10} z={z} rotY={Math.PI} />
            <StreetLight x={10} z={z} rotY={0} />
          </React.Fragment>
        ))}

        {/* Employee parking lights */}
        {[-4, 4, 12, 20].map((z, i) => (
          <StreetLight key={`slp-${i}`} x={-110} z={z} rotY={Math.PI / 2} />
        ))}

        {/* North perimeter lights */}
        {[-80, -50, -20, 10, 40, 70].map((x, i) => (
          <StreetLight key={`slpn-${i}`} x={x} z={-58} rotY={0} />
        ))}

        {/* West perimeter lights */}
        {[-48, -24, 0, 24, 48].map((z, i) => (
          <StreetLight key={`slpw-${i}`} x={-85} z={z} rotY={-Math.PI / 2} />
        ))}

        {/* East perimeter / truck staging */}
        {[-48, -24, 0, 24, 48].map((z, i) => (
          <StreetLight key={`slpe-${i}`} x={81} z={z} rotY={Math.PI / 2} />
        ))}
      </group>

      {/* ================================================================ */}
      {/* M. UTILITY INFRASTRUCTURE                                        */}
      {/* ================================================================ */}
      <group>
        {/* Manholes on roads */}
        {[[0, 0.045, -34], [0, 0.045, -2], [0, 0.045, 28], [-16, 0.045, -16], [16, 0.045, -16], [0, 0.045, 22], [-28, 0.045, -16]].map((pos, i) => (
          <mesh key={`mh-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
            <circleGeometry args={[0.55, 12]} />
            <meshStandardMaterial color="#374151" roughness={0.95} metalness={0.22} />
          </mesh>
        ))}

        {/* Electrical service cabinets */}
        {[[-56, -28], [56, -22], [-56, 22], [2, -52], [40, 32]].map(([ex, ez], i) => (
          <group key={`ec-${i}`} position={[ex, 0, ez]}>
            <mesh position={[0, 0.88, 0]} castShadow>
              <boxGeometry args={[0.68, 1.76, 0.46]} />
              <meshStandardMaterial color="#4B5965" metalness={0.52} roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.88, 0.26]}>
              <boxGeometry args={[0.56, 1.52, 0.07]} />
              <meshStandardMaterial color="#374151" metalness={0.56} roughness={0.34} />
            </mesh>
          </group>
        ))}

        {/* Fire hydrants */}
        {[[-36, 24], [26, -26], [-24, 40]].map(([hx, hz], i) => (
          <group key={`fh-${i}`} position={[hx, 0, hz]}>
            <mesh position={[0, 0.46, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.17, 0.92, 10]} />
              <meshStandardMaterial color="#DC2626" roughness={0.32} metalness={0.42} />
            </mesh>
            <mesh position={[0, 0.96, 0]}>
              <cylinderGeometry args={[0.23, 0.23, 0.22, 10]} />
              <meshStandardMaterial color="#DC2626" roughness={0.32} metalness={0.42} />
            </mesh>
          </group>
        ))}

        {/* Utility poles west perimeter exterior */}
        {[-44, -24, -4, 16, 36].map((pz, i) => (
          <mesh key={`up-${i}`} position={[-116, 6.8, pz]} castShadow>
            <cylinderGeometry args={[0.12, 0.17, 13.6, 8]} />
            <meshStandardMaterial color="#5D4037" roughness={0.86} />
          </mesh>
        ))}

        {/* Speed bumps */}
        {[[-15, 5], [15, -8]].map(([sbx, sbz], i) => (
          <mesh key={`sb-${i}`} position={[sbx, 0.062, sbz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[13, 0.58]} />
            <meshStandardMaterial color="#EAB308" roughness={0.62} />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* N. LOADING AREA SURROUNDINGS                                     */}
      {/* ================================================================ */}

      {/* WAREHOUSE (BLD-WH-08): dock apron and equipment */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-46, 0.012, 34]} receiveShadow>
        <planeGeometry args={[38, 9]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} metalness={0.04} />
      </mesh>
      {/* Dock bumper posts */}
      {[-58, -50, -42, -34].map((bx, bi) => (
        <mesh key={`db-${bi}`} position={[bx, 0.6, 31.5]} castShadow>
          <boxGeometry args={[0.26, 1.2, 0.26]} />
          <meshStandardMaterial color="#EAB308" roughness={0.38} metalness={0.32} />
        </mesh>
      ))}
      {/* Wheel stops */}
      {[-56, -52, -48, -44, -40, -36].map((bx, bi) => (
        <mesh key={`ws-${bi}`} position={[bx, 0.12, 30.5]} castShadow>
          <boxGeometry args={[1.85, 0.24, 0.44]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.52} />
        </mesh>
      ))}
      {/* Pallet stacks at warehouse */}
      {[[-55, 33], [-50, 33], [-45, 33]].map(([px, pz], i) => (
        <mesh key={`wpal-${i}`} position={[px, 0.36, pz]} castShadow>
          <boxGeometry args={[1.2, 0.72, 0.95]} />
          <meshStandardMaterial color="#8B6914" roughness={0.86} />
        </mesh>
      ))}

      {/* LOGISTICS (BLD-LOG-12): dock area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, 0.012, 49]} receiveShadow>
        <planeGeometry args={[34, 9]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} metalness={0.04} />
      </mesh>
      {[4, 10, 16, 22, 28, 34].map((lx, li) => (
        <mesh key={`lb-${li}`} position={[lx, 0.6, 46.5]} castShadow>
          <boxGeometry args={[0.26, 1.2, 0.26]} />
          <meshStandardMaterial color="#EAB308" roughness={0.38} metalness={0.32} />
        </mesh>
      ))}
      {[22, 26, 30].map((lx, li) => (
        <mesh key={`lpal-${li}`} position={[lx, 0.35, 44.5]} castShadow>
          <boxGeometry args={[1.2, 0.7, 0.92]} />
          <meshStandardMaterial color="#8B6914" roughness={0.86} />
        </mesh>
      ))}

      {/* ================================================================ */}
      {/* O. PARKED VEHICLES — Realistic campus traffic                    */}
      {/* ================================================================ */}

      {/* Employee parking — Row 1 */}
      {[
        { x: -90, z: -1, c: '#2563EB' }, { x: -88, z: -1, c: '#DC2626' },
        { x: -86, z: -1, c: '#475569' }, { x: -84, z: -1, c: '#E2E8F0' },
        { x: -82, z: -1, c: '#16A34A' }, { x: -80, z: -1, c: '#0F172A' },
        { x: -78, z: -1, c: '#EA580C' }, { x: -76, z: -1, c: '#3B82F6' },
        { x: -74, z: -1, c: '#7C3AED' }, { x: -72, z: -1, c: '#BE185D' },
      ].map((car, i) => <ParkedCar key={`e1-${i}`} x={car.x} z={car.z} color={car.c} />)}

      {/* Employee parking — Row 2 */}
      {[
        { x: -90, z: 7.5, c: '#1D4ED8' }, { x: -88, z: 7.5, c: '#B91C1C' },
        { x: -86, z: 7.5, c: '#64748B' }, { x: -84, z: 7.5, c: '#F1F5F9' },
        { x: -82, z: 7.5, c: '#15803D' }, { x: -80, z: 7.5, c: '#1E293B' },
        { x: -78, z: 7.5, c: '#C2410C' }, { x: -76, z: 7.5, c: '#2563EB' },
        { x: -74, z: 7.5, c: '#DC2626' }, { x: -72, z: 7.5, c: '#475569' },
      ].map((car, i) => <ParkedCar key={`e2-${i}`} x={car.x} z={car.z} color={car.c} />)}

      {/* Employee parking — Row 3 */}
      {[
        { x: -90, z: 16, c: '#0284C7' }, { x: -88, z: 16, c: '#DC2626' },
        { x: -86, z: 16, c: '#374151' }, { x: -84, z: 16, c: '#CBD5E1' },
        { x: -82, z: 16, c: '#16A34A' }, { x: -80, z: 16, c: '#1E293B' },
        { x: -78, z: 16, c: '#EA580C' }, { x: -76, z: 16, c: '#3B82F6' },
      ].map((car, i) => <ParkedCar key={`e3-${i}`} x={car.x} z={car.z} color={car.c} />)}

      {/* Visitor parking */}
      {[
        { x: -12, z: 68, c: '#2563EB' }, { x: -8, z: 68, c: '#DC2626' },
        { x: -4,  z: 68, c: '#475569' }, { x: 0,  z: 68, c: '#E2E8F0' },
        { x: 4,   z: 68, c: '#16A34A' }, { x: 8,  z: 68, c: '#7C3AED' },
      ].map((car, i) => <ParkedCar key={`vis-${i}`} x={car.x} z={car.z} color={car.c} rotY={Math.PI} />)}

      {/* Semi trucks: truck staging area */}
      <SemiTruck x={88} z={15} cabColor="#DC2626" rotY={Math.PI} />
      <SemiTruck x={88} z={30} cabColor="#1D4ED8" rotY={Math.PI} />
      <SemiTruck x={88} z={45} cabColor="#374151" rotY={Math.PI / 2} />

      {/* Truck docked at warehouse */}
      <SemiTruck x={-46} z={35} cabColor="#DC2626" rotY={0} />

      {/* Box trucks at logistics */}
      <BoxTruck x={10} z={50} color="#4B5965" rotY={Math.PI} />
      <BoxTruck x={26} z={50} color="#1D4ED8" rotY={Math.PI} />

      {/* Forklifts near loading bays */}
      <Forklift x={-54} z={24} rotY={Math.PI / 4} />
      <Forklift x={24} z={45} rotY={-Math.PI / 3} />

      {/* Slow-moving truck on perimeter */}
      <group ref={movingTruckRef} position={[98, 0, -8]}>
        <SemiTruck x={0} z={0} cabColor="#EAB308" rotY={0} />
      </group>

      {/* Car entering campus from south */}
      <group ref={movingCar1Ref} position={[-4, 0, 85]}>
        <ParkedCar x={0} z={0} color="#2563EB" rotY={Math.PI} />
      </group>

      {/* Car on north perimeter road */}
      <group ref={movingCar2Ref} position={[-80, 0, -112]}>
        <ParkedCar x={0} z={0} color="#DC2626" rotY={0} />
      </group>

      {/* ================================================================ */}
      {/* P. DISTANT BACKGROUND BUILDINGS — industrial district depth      */}
      {/* ================================================================ */}

      {/* Northwest industrial zone */}
      <BgBuilding x={-142} z={-85} w={38} h={10} d={24} wallC="#C5CDD4" roofC="#4A6070" />
      <BgBuilding x={-126} z={-70} w={25} h={13} d={20} wallC="#BEC7CE" roofC="#3E5868" />
      <BgBuilding x={-158} z={-72} w={32} h={8} d={34} wallC="#C8D0D8" roofC="#4A6275" />
      <BgBuilding x={-146} z={-50} w={20} h={7} d={18} wallC="#CBD3DA" roofC="#455C6A" />
      <BgBuilding x={-136} z={-58} w={16} h={11} d={14} wallC="#BCC5CC" roofC="#3E5F72" />

      {/* Northeast industrial zone */}
      <BgBuilding x={140} z={-82} w={35} h={11} d={26} wallC="#C5CDD4" roofC="#3E5F72" />
      <BgBuilding x={124} z={-66} w={22} h={9} d={20} wallC="#C0C9D0" roofC="#4A6070" />
      <BgBuilding x={156} z={-68} w={28} h={13} d={22} wallC="#CBD3DA" roofC="#3B5868" />
      <BgBuilding x={144} z={-52} w={18} h={8} d={16} wallC="#C5CDD4" roofC="#455C6A" />

      {/* Far south (across main road) */}
      <BgBuilding x={-56} z={130} w={32} h={9} d={24} wallC="#C0C9D0" roofC="#4A6070" />
      <BgBuilding x={56} z={128} w={30} h={10} d={22} wallC="#C5CDD4" roofC="#3E5F72" />
      <BgBuilding x={0} z={142} w={44} h={8} d={28} wallC="#BEC7CE" roofC="#455C6A" />

      {/* East additional */}
      <BgBuilding x={150} z={12} w={24} h={9} d={30} wallC="#C5CDD4" roofC="#4A6070" />
      <BgBuilding x={146} z={38} w={20} h={7} d={20} wallC="#CBD3DA" roofC="#3E5868" />
      <BgBuilding x={144} z={-20} w={18} h={12} d={18} wallC="#C5CDD4" roofC="#3E5F72" />

      {/* West additional */}
      <BgBuilding x={-148} z={10} w={22} h={8} d={28} wallC="#C0C9D0" roofC="#455C6A" />
      <BgBuilding x={-146} z={34} w={18} h={10} d={20} wallC="#C5CDD4" roofC="#4A6070" />
      <BgBuilding x={-150} z={-18} w={24} h={9} d={22} wallC="#BEC7CE" roofC="#3E5868" />

      {/* ================================================================ */}
      {/* *** EXISTING FACTORY — DO NOT MODIFY ANYTHING BELOW HERE ***     */}
      {/* ================================================================ */}

      {/* ================================================================ */}
      {/* 6. 12 INDUSTRIAL CAMPUS BUILDINGS — Realistic 3D                 */}
      {/* ================================================================ */}
      {campusBuildings.map((bld) => {
        const [w, h, d] = bld.dimensions;
        const [x, , z] = bld.position;
        const isSelected = selectedBuildingId === bld.id;
        const isInteriorCutaway = isCutawayActive || isSelected || enteredBuildingId === bld.id || viewMode === 'FLOOR 1' || viewMode === 'INTERIOR';
        const wallC = isSelected ? '#3B82F6' : bld.wallColor;
        const roofC = bld.roofColor;
        const steelC = bld.steelColor || '#4B5965';
        const winC = bld.windowColor || '#263F55';
        const accentC = bld.accentColor;

        // Corner column positions
        const corners = [
          [-w / 2, -d / 2], [w / 2, -d / 2],
          [-w / 2,  d / 2], [w / 2,  d / 2],
        ];

        // Pilaster spacing (intermediate vertical strips)
        const pilasterXPositions = [-w / 4, 0, w / 4];
        const pilasterZPositions = [-d / 4, 0, d / 4];

        return (
          <group
            key={bld.id}
            position={[x, 0, z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectBuilding?.(bld.id);
            }}
          >
            {/* 1. Raised Concrete Foundation Plinth */}
            <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
              <boxGeometry args={[w + 1.4, 0.64, d + 1.4]} />
              <meshStandardMaterial color="#B8C1C8" roughness={0.85} metalness={0.04} />
            </mesh>

            {/* 2. Dark Damp-Proof Course Band at base */}
            <mesh position={[0, 0.72, 0]} castShadow>
              <boxGeometry args={[w + 1.2, 0.32, d + 1.2]} />
              <meshStandardMaterial color={steelC} roughness={0.6} metalness={0.35} />
            </mesh>

            {/* 3. Interior Epoxy Slab (visible in cutaway) */}
            {isInteriorCutaway && (
              <mesh position={[0, 0.66, 0]} receiveShadow>
                <boxGeometry args={[w - 0.5, 0.06, d - 0.5]} />
                <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.2} />
              </mesh>
            )}

            {/* Interior safety walkway lanes (visible in cutaway) */}
            {isInteriorCutaway && (
              <group position={[0, 0.72, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1.8, d - 2.5]} />
                  <meshBasicMaterial color="#EAB308" opacity={0.8} transparent />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[w - 2.5, 1.8]} />
                  <meshBasicMaterial color="#EAB308" opacity={0.8} transparent />
                </mesh>
              </group>
            )}

            {/* 4. Structural Steel Columns at all four corners */}
            {corners.map(([cx, cz], ci) => (
              <SteelColumn key={`col-${ci}`} x={cx} z={cz} h={h + 0.5} color={steelC} />
            ))}

            {/* 5. Intermediate wall pilasters (vertical ribs for visual depth) */}
            {pilasterXPositions.map((px, pi) => (
              <WallPilaster key={`pilZ-${pi}`} x={px} z={d / 2 + 0.08} h={h} color="#C2CDD4" />
            ))}
            {pilasterXPositions.map((px, pi) => (
              <WallPilaster key={`pilZb-${pi}`} x={px} z={-d / 2 - 0.08} h={h} color="#C2CDD4" />
            ))}
            {pilasterZPositions.map((pz, pi) => (
              <WallPilaster key={`pilX-${pi}`} x={w / 2 + 0.08} z={pz} h={h} color="#C2CDD4" />
            ))}
            {pilasterZPositions.map((pz, pi) => (
              <WallPilaster key={`pilXb-${pi}`} x={-w / 2 - 0.08} z={pz} h={h} color="#C2CDD4" />
            ))}

            {/* 6. Main Wall Shell */}
            {isInteriorCutaway ? (
              <group>
                {/* Back wall */}
                <mesh position={[0, h * 0.5, -d * 0.5]} castShadow receiveShadow>
                  <boxGeometry args={[w, h, 0.35]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
                {/* Left wall */}
                <mesh position={[-w * 0.5, h * 0.5, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.35, h, d]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
                {/* Right wall */}
                <mesh position={[w * 0.5, h * 0.5, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.35, h, d]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
                {/* Low front knee-wall only */}
                <mesh position={[0, 1.2, d * 0.5]} castShadow receiveShadow>
                  <boxGeometry args={[w, 1.8, 0.35]} />
                  <meshStandardMaterial color={accentC} roughness={0.5} metalness={0.15} />
                </mesh>
                {/* Overhead gantry crane rail */}
                <mesh position={[0, h - 1.1, 0]} castShadow>
                  <boxGeometry args={[w - 1.2, 0.55, 0.75]} />
                  <meshStandardMaterial color="#F59E0B" roughness={0.4} metalness={0.6} />
                </mesh>
              </group>
            ) : (
              <group>
                {/* Front wall */}
                <mesh position={[0, h * 0.5, d * 0.5]} castShadow receiveShadow>
                  <boxGeometry args={[w, h, 0.35]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
                {/* Back wall */}
                <mesh position={[0, h * 0.5, -d * 0.5]} castShadow receiveShadow>
                  <boxGeometry args={[w, h, 0.35]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
                {/* Left wall */}
                <mesh position={[-w * 0.5, h * 0.5, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.35, h, d]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
                {/* Right wall */}
                <mesh position={[w * 0.5, h * 0.5, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.35, h, d]} />
                  <meshStandardMaterial color={wallC} roughness={0.65} metalness={0.06} />
                </mesh>
              </group>
            )}

            {/* 7. Accent fascia band at mid-height */}
            <mesh position={[0, h * 0.28, 0]} castShadow>
              <boxGeometry args={[w + 0.4, 0.85, d + 0.4]} />
              <meshStandardMaterial color={accentC} roughness={0.45} metalness={0.25} />
            </mesh>

            {/* 8. Clerestory ribbon window strip (upper walls) */}
            <mesh position={[0, h * 0.72, d * 0.5 + 0.02]} castShadow>
              <boxGeometry args={[w * 0.7, 1.2, 0.12]} />
              <meshStandardMaterial
                color={winC}
                roughness={0.08}
                metalness={0.85}
                transparent
                opacity={isInteriorCutaway ? 0.2 : 0.82}
              />
            </mesh>
            <mesh position={[0, h * 0.72, -d * 0.5 - 0.02]} castShadow>
              <boxGeometry args={[w * 0.7, 1.2, 0.12]} />
              <meshStandardMaterial
                color={winC}
                roughness={0.08}
                metalness={0.85}
                transparent
                opacity={isInteriorCutaway ? 0.2 : 0.82}
              />
            </mesh>

            {/* 9. Loading bay roll-up doors (front facade) */}
            <LoadingDoor x={-w * 0.26} y={2.5} z={d * 0.5} facingZ color={steelC} w={3.8} h={4.2} />
            <LoadingDoor x={w * 0.26} y={2.5} z={d * 0.5} facingZ color={steelC} w={3.8} h={4.2} />

            {/* 10. Pitched / Barrel Metal Roof (two sloped halves) */}
            {/* Ridgeline crown */}
            <mesh position={[0, h + 0.95, 0]} castShadow receiveShadow visible={!isInteriorCutaway}>
              <boxGeometry args={[w + 1.2, 0.55, 0.75]} />
              <meshStandardMaterial color={steelC} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Front slope */}
            <mesh position={[0, h + 0.48, d * 0.25 + 0.2]} rotation={[0.18, 0, 0]} castShadow receiveShadow visible={!isInteriorCutaway}>
              <boxGeometry args={[w + 1.0, 0.35, d * 0.56]} />
              <meshStandardMaterial
                color={roofC}
                roughness={0.55}
                metalness={0.45}
              />
            </mesh>
            {/* Rear slope */}
            <mesh position={[0, h + 0.48, -d * 0.25 - 0.2]} rotation={[-0.18, 0, 0]} castShadow receiveShadow visible={!isInteriorCutaway}>
              <boxGeometry args={[w + 1.0, 0.35, d * 0.56]} />
              <meshStandardMaterial
                color={roofC}
                roughness={0.55}
                metalness={0.45}
              />
            </mesh>
            {/* Parapet/fascia edge */}
            <mesh position={[0, h + 0.32, d * 0.5 + 0.55]} castShadow>
              <boxGeometry args={[w + 1.0, 0.65, 0.22]} />
              <meshStandardMaterial color={steelC} metalness={0.65} roughness={0.35} />
            </mesh>
            <mesh position={[0, h + 0.32, -d * 0.5 - 0.55]} castShadow>
              <boxGeometry args={[w + 1.0, 0.65, 0.22]} />
              <meshStandardMaterial color={steelC} metalness={0.65} roughness={0.35} />
            </mesh>

            {/* 11. Rooftop HVAC units */}
            <HvacUnit x={-w * 0.22} z={0} baseY={h + 0.8} />
            <HvacUnit x={w * 0.22} z={0} baseY={h + 0.8} />

            {/* 12. Rooftop exhaust / smoke vents */}
            <RoofVent x={-w * 0.35} z={d * 0.2} baseY={h + 0.8} />
            <RoofVent x={w * 0.35} z={-d * 0.2} baseY={h + 0.8} />

            {/* 13. Safety railing at roof parapet level */}
            <mesh position={[0, h + 1.45, d * 0.5 + 0.65]} castShadow>
              <boxGeometry args={[w + 1.0, 0.08, 0.06]} />
              <meshStandardMaterial color={steelC} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, h + 1.45, -d * 0.5 - 0.65]} castShadow>
              <boxGeometry args={[w + 1.0, 0.08, 0.06]} />
              <meshStandardMaterial color={steelC} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* 14. Building sector label sign (dark blue panel) */}
            <group position={[0, h + 2.0, d * 0.5 + 0.9]}>
              <mesh castShadow>
                <boxGeometry args={[Math.min(w * 0.55, 9.0), 1.0, 0.18]} />
                <meshStandardMaterial
                  color={isSelected ? '#1677E8' : '#17324D'}
                  roughness={0.3}
                  metalness={0.2}
                />
              </mesh>
              {/* Green status dot */}
              <mesh position={[Math.min(w * 0.55, 9.0) * 0.45, 0, 0.12]}>
                <sphereGeometry args={[0.14, 10, 10]} />
                <meshBasicMaterial
                  color={bld.status === 'WARNING' ? '#F59E0B' : '#16A765'}
                />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* ================================================================ */}
      {/* 7. MULTI-COLORED INDUSTRIAL PIPE TRESTLE NETWORK                 */}
      {/* ================================================================ */}
      <group position={[0, 0, 0]}>
        {/* Pipe bridge towers along N-S spine */}
        {[-35, -20, -5, 10, 25].map((pz, idx) => (
          <group key={`pipe-tower-${idx}`} position={[0, 0, pz]}>
            <mesh position={[-8.5, 4.8, 0]} castShadow>
              <boxGeometry args={[0.4, 9.6, 0.4]} />
              <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[8.5, 4.8, 0]} castShadow>
              <boxGeometry args={[0.4, 9.6, 0.4]} />
              <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Cross bracing */}
            <mesh position={[0, 4.8, 0]} castShadow>
              <boxGeometry args={[17.2, 0.4, 0.4]} />
              <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.5, 0]} castShadow>
              <boxGeometry args={[17.2, 0.3, 0.3]} />
              <meshStandardMaterial color="#26343F" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* 6 colour-coded industrial pipes running N-S */}
        <mesh position={[-5.2, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 80, 16]} />
          <meshStandardMaterial color="#0284C7" metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh position={[-3.2, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 80, 14]} />
          <meshStandardMaterial color="#DC2626" metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh position={[-1.2, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 80, 14]} />
          <meshStandardMaterial color="#EAB308" metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh position={[0.8, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 80, 14]} />
          <meshStandardMaterial color="#EA580C" metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh position={[2.8, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 80, 16]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.18} />
        </mesh>
        <mesh position={[4.8, 9.5, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 80, 14]} />
          <meshStandardMaterial color="#16A34A" metalness={0.55} roughness={0.28} />
        </mesh>

        {/* E-W lateral pipe run to process plant */}
        <mesh position={[20, 8.8, -8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 40, 14]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.18} />
        </mesh>
        <mesh position={[20, 8.8, -8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 40, 12]} />
          <meshStandardMaterial color="#0284C7" metalness={0.55} roughness={0.28} />
        </mesh>

        {/* Pipe support columns for lateral run */}
        {[8, 18, 28].map((px, pi) => (
          <mesh key={`lp-${pi}`} position={[px, 4.4, -8]} castShadow>
            <boxGeometry args={[0.35, 8.8, 0.35]} />
            <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* 8. ANIMATED STEAM PUFFS — Cooling towers & boiler stacks         */}
      {/* ================================================================ */}
      <group ref={steamRef} position={[18, 0, -22]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[i % 2 === 0 ? -3 : 3, 14, 0]}>
            <sphereGeometry args={[1.4, 10, 10]} />
            <meshStandardMaterial
              color="#FFFFFF"
              transparent
              opacity={0.28}
              roughness={1.0}
              metalness={0.0}
            />
          </mesh>
        ))}
      </group>

      <group ref={steam2Ref} position={[42, 0, -8]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 3, 16, 0]}>
            <sphereGeometry args={[1.1, 10, 10]} />
            <meshStandardMaterial
              color="#E8EDF0"
              transparent
              opacity={0.22}
              roughness={1.0}
            />
          </mesh>
        ))}
      </group>

      {/* ================================================================ */}
      {/* 12. EXHAUST STACKS — Process Plant & Boiler House                */}
      {/* ================================================================ */}
      <ExhaustStack x={50} z={-18} h={22} r={0.6} />
      <ExhaustStack x={54} z={-12} h={16} r={0.45} />
      <ExhaustStack x={24} z={-28} h={14} r={0.5} />
      <ExhaustStack x={20} z={-32} h={12} r={0.4} />

      {/* ================================================================ */}
      {/* 13. ELECTRICAL SUBSTATION COMPOUND — Fenced yard, transformers   */}
      {/* ================================================================ */}
      <group position={[44, 0, 18]}>
        {/* Gravel yard */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
          <planeGeometry args={[24, 22]} />
          <meshStandardMaterial color="#8B9199" roughness={0.95} />
        </mesh>

        {/* Substation fence posts */}
        {[-10, -5, 0, 5, 10].map((px, pi) => (
          <React.Fragment key={`spf-${pi}`}>
            <mesh position={[px, 1.4, -11]} castShadow>
              <boxGeometry args={[0.14, 2.8, 0.14]} />
              <meshStandardMaterial color="#26343F" metalness={0.7} />
            </mesh>
            <mesh position={[px, 1.4, 11]} castShadow>
              <boxGeometry args={[0.14, 2.8, 0.14]} />
              <meshStandardMaterial color="#26343F" metalness={0.7} />
            </mesh>
          </React.Fragment>
        ))}
        {[-9, -4, 1, 6].map((pz, pi) => (
          <React.Fragment key={`spfz-${pi}`}>
            <mesh position={[-11, 1.4, pz]} castShadow>
              <boxGeometry args={[0.14, 2.8, 0.14]} />
              <meshStandardMaterial color="#26343F" metalness={0.7} />
            </mesh>
            <mesh position={[11, 1.4, pz]} castShadow>
              <boxGeometry args={[0.14, 2.8, 0.14]} />
              <meshStandardMaterial color="#26343F" metalness={0.7} />
            </mesh>
          </React.Fragment>
        ))}
        {/* Fence rails */}
        <mesh position={[0, 2.6, -11]}><boxGeometry args={[22, 0.1, 0.1]} /><meshStandardMaterial color="#4B5965" /></mesh>
        <mesh position={[0, 2.6, 11]}><boxGeometry args={[22, 0.1, 0.1]} /><meshStandardMaterial color="#4B5965" /></mesh>
        <mesh position={[-11, 2.6, 0]}><boxGeometry args={[0.1, 0.1, 22]} /><meshStandardMaterial color="#4B5965" /></mesh>
        <mesh position={[11, 2.6, 0]}><boxGeometry args={[0.1, 0.1, 22]} /><meshStandardMaterial color="#4B5965" /></mesh>

        {/* Power transformers — 3 units */}
        {[-6, 0, 6].map((tx, ti) => (
          <group key={`tr-${ti}`} position={[tx, 0, -4]}>
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[3.0, 2.2, 2.2]} />
              <meshStandardMaterial color="#374151" metalness={0.55} roughness={0.4} />
            </mesh>
            {/* Insulator stacks */}
            {[-0.8, 0, 0.8].map((ix, ii) => (
              <mesh key={`ins-${ii}`} position={[ix, 2.6, 0]} castShadow>
                <cylinderGeometry args={[0.14, 0.14, 1.0, 10]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.05} />
              </mesh>
            ))}
            {/* Top busbar */}
            <mesh position={[0, 3.2, 0]} castShadow>
              <boxGeometry args={[2.0, 0.1, 0.1]} />
              <meshStandardMaterial color="#4B5965" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* High-voltage gantry poles */}
        {[-8, 8].map((px, pi) => (
          <group key={`hvp-${pi}`} position={[px, 0, -7]}>
            <mesh position={[0, 5.5, 0]} castShadow>
              <boxGeometry args={[0.3, 11, 0.3]} />
              <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 10.2, 0]} castShadow>
              <boxGeometry args={[5.0, 0.25, 0.25]} />
              <meshStandardMaterial color="#4B5965" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
