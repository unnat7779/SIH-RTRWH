"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"

export default function ARRoofMeasurement({ onAreaCalculated, onClose }) {
  const mountRef = useRef(null)
  const [supportsAR, setSupportsAR] = useState(null)
  const [metrics, setMetrics] = useState({ area: 0, perimeter: 0, points: 0 })
  const [isCalibrating, setIsCalibrating] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [confidence, setConfidence] = useState(0)

  // Enhanced Three.js scene management
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)

  // WebXR / AR state
  const xrRef = useRef(null)
  const refSpaceRef = useRef(null)
  const hitTestSourceRef = useRef(null)
  const reticleRef = useRef(null)

  // Enhanced geometry state
  const pointsRef = useRef([])
  const lineRef = useRef(null)
  const fillMeshRef = useRef(null)
  const pointMarkersRef = useRef([])
  const previewLineRef = useRef(null)

  // UI state management
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState("Move your device to find a flat surface")
  const [step, setStep] = useState("detecting")

  useEffect(() => {
    if (isComplete && metrics.area > 0 && onAreaCalculated) {
      onAreaCalculated(metrics.area)
    }
  }, [isComplete, metrics.area, onAreaCalculated])

  // Enhanced AR support detection
  useEffect(() => {
    const checkAR = async () => {
      if (typeof navigator !== "undefined" && "xr" in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported("immersive-ar")
          setSupportsAR(!!supported)
        } catch {
          setSupportsAR(false)
        }
      } else {
        setSupportsAR(false)
      }
    }
    checkAR()
  }, [])

  // Enhanced AR session initialization
  const startAR = async () => {
    if (!supportsAR || running) return

    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
      renderer.xr.enabled = true
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera()

      // Enhanced lighting setup
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8)
      scene.add(hemisphereLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
      directionalLight.position.set(0, 10, 5)
      directionalLight.castShadow = true
      scene.add(directionalLight)

      // Enhanced reticle with animation
      const ringGeometry = new THREE.RingGeometry(0.08, 0.12, 32)
      const pulseGeometry = new THREE.RingGeometry(0.12, 0.16, 32)

      const reticle = new THREE.Group()
      const ring = new THREE.Mesh(
        ringGeometry.rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.8,
        }),
      )
      const pulse = new THREE.Mesh(
        pulseGeometry.rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.3,
        }),
      )

      reticle.add(ring)
      reticle.add(pulse)
      reticle.matrixAutoUpdate = false
      reticle.visible = false
      scene.add(reticle)

      // Enhanced line visualization
      const lineGeometry = new THREE.BufferGeometry()
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        linewidth: 3,
        transparent: true,
        opacity: 0.9,
      })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(line)

      // Preview line for current drawing
      const previewGeometry = new THREE.BufferGeometry()
      const previewMaterial = new THREE.LineDashedMaterial({
        color: 0x88ff00,
        linewidth: 2,
        dashSize: 0.1,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.6,
      })
      const previewLine = new THREE.Line(previewGeometry, previewMaterial)
      scene.add(previewLine)

      // Store references
      rendererRef.current = renderer
      sceneRef.current = scene
      cameraRef.current = camera
      reticleRef.current = reticle
      lineRef.current = line
      previewLineRef.current = previewLine

      // Mount renderer
      if (mountRef.current) {
        mountRef.current.innerHTML = ""
        mountRef.current.appendChild(renderer.domElement)
      }

      // Request enhanced AR session
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test", "local-floor"],
        optionalFeatures: ["plane-detection", "anchors", "light-estimation"],
      })

      xrRef.current = session
      renderer.xr.setSession(session)

      // Setup reference spaces
      const refSpace = await session.requestReferenceSpace("local-floor")
      refSpaceRef.current = refSpace

      const viewerSpace = await session.requestReferenceSpace("viewer")
      const hitTestSource = await session.requestHitTestSource({ space: viewerSpace })
      hitTestSourceRef.current = hitTestSource

      // Enhanced input handling
      const onSelect = () => {
        if (!reticleRef.current || !reticleRef.current.visible) return

        const position = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix)

        // Check if clicking near the first point to close polygon
        if (pointsRef.current.length >= 3) {
          const firstPoint = pointsRef.current[0]
          const distance = position.distanceTo(firstPoint)
          if (distance < 0.3) {
            // 30cm threshold
            completePolygon()
            return
          }
        }

        addPoint(position)
      }

      session.addEventListener("select", onSelect)

      // Handle session end
      session.addEventListener("end", () => {
        cleanup()
      })

      // Enhanced resize handling
      const handleResize = () => {
        if (!renderer || !camera) return
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      }
      window.addEventListener("resize", handleResize)

      setRunning(true)
      setStep("detecting")
      setMessage("Look for a flat surface and tap to start measuring")

      // Enhanced animation loop
      let animationTime = 0
      renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame) return

        animationTime = timestamp
        const pose = frame.getViewerPose(refSpace)
        if (!pose) return

        // Enhanced hit testing with confidence
        const hitTestResults = frame.getHitTestResults(hitTestSource)
        if (hitTestResults && hitTestResults.length > 0) {
          const hit = hitTestResults[0]
          const hitPose = hit.getPose(refSpace)

          if (hitPose && reticle) {
            reticle.visible = true
            reticle.matrix.fromArray(hitPose.transform.matrix)

            // Animate reticle pulse
            const pulseScale = 1 + 0.1 * Math.sin(animationTime * 0.008)
            reticle.children[1].scale.setScalar(pulseScale)

            // Update confidence based on surface stability
            setConfidence(Math.min(confidence + 0.02, 1))

            if (step === "detecting" && confidence > 0.7) {
              setStep("measuring")
              setIsCalibrating(false)
            }
          }
        } else if (reticle) {
          reticle.visible = false
          setConfidence(Math.max(confidence - 0.05, 0))
        }

        // Update preview line
        updatePreviewLine()

        renderer.render(scene, camera)
      })
    } catch (error) {
      console.error("AR initialization failed:", error)
      setMessage("Failed to start AR. Please try again.")
    }
  }

  // Enhanced point addition with visual feedback
  const addPoint = useCallback((position) => {
    pointsRef.current.push(position.clone())

    // Create point marker
    const markerGeometry = new THREE.SphereGeometry(0.03, 16, 12)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: pointsRef.current.length === 1 ? 0xff4444 : 0x00ff88,
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(position)
    sceneRef.current.add(marker)
    pointMarkersRef.current.push(marker)

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    updateShapes()
    updateUI()
  }, [])

  // Enhanced preview line update
  const updatePreviewLine = useCallback(() => {
    if (!previewLineRef.current || pointsRef.current.length === 0 || !reticleRef.current?.visible) return

    const lastPoint = pointsRef.current[pointsRef.current.length - 1]
    const currentPoint = new THREE.Vector3().setFromMatrixPosition(reticleRef.current.matrix)

    const positions = new Float32Array(6)
    positions[0] = lastPoint.x
    positions[1] = lastPoint.y
    positions[2] = lastPoint.z
    positions[3] = currentPoint.x
    positions[4] = currentPoint.y
    positions[5] = currentPoint.z

    previewLineRef.current.geometry.dispose()
    previewLineRef.current.geometry = new THREE.BufferGeometry()
    previewLineRef.current.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    previewLineRef.current.computeLineDistances()
  }, [])

  // Enhanced polygon completion
  const completePolygon = useCallback(() => {
    if (pointsRef.current.length < 3) return

    setIsComplete(true)
    setStep("complete")
    setMessage("Measurement complete! Tap 'Use This Area' to apply the measurement.")

    // Visual feedback for completion
    if (fillMeshRef.current) {
      fillMeshRef.current.material.opacity = 0.4
      fillMeshRef.current.material.color.setHex(0x44ff44)
    }

    // Celebration haptic
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }, [])

  // Enhanced shape updates with better triangulation
  const updateShapes = useCallback(() => {
    const pts = pointsRef.current
    const scene = sceneRef.current
    if (!scene) return

    // Update connection lines
    const linePath = [...pts]
    if (pts.length >= 2 && !isComplete) {
      // Don't close the line until completion
    } else if (pts.length >= 3) {
      linePath.push(pts[0]) // Close the polygon
    }

    if (linePath.length >= 2) {
      const positions = new Float32Array(linePath.length * 3)
      linePath.forEach((v, i) => {
        positions[i * 3] = v.x
        positions[i * 3 + 1] = v.y
        positions[i * 3 + 2] = v.z
      })

      if (lineRef.current) {
        lineRef.current.geometry.dispose()
        lineRef.current.geometry = new THREE.BufferGeometry()
        lineRef.current.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      }
    }

    // Remove previous fill
    if (fillMeshRef.current) {
      scene.remove(fillMeshRef.current)
      fillMeshRef.current.geometry.dispose()
      fillMeshRef.current = null
    }

    let area = 0
    let perimeter = 0

    if (pts.length >= 3) {
      // Enhanced area calculation with better plane fitting
      const { area: calculatedArea, perimeter: calculatedPerimeter } = calculatePolygonMetrics(pts)
      area = calculatedArea
      perimeter = calculatedPerimeter

      // Create enhanced filled polygon
      if (pts.length >= 3) {
        const fillGeometry = createPolygonGeometry(pts)
        const fillMaterial = new THREE.MeshBasicMaterial({
          color: isComplete ? 0x44ff44 : 0x00ff88,
          transparent: true,
          opacity: isComplete ? 0.4 : 0.2,
          side: THREE.DoubleSide,
        })
        const fill = new THREE.Mesh(fillGeometry, fillMaterial)
        scene.add(fill)
        fillMeshRef.current = fill
      }
    } else if (pts.length === 2) {
      perimeter = pts[0].distanceTo(pts[1]) * 2
    }

    setMetrics({ area, perimeter, points: pts.length })
  }, [isComplete])

  // Enhanced polygon geometry creation
  const createPolygonGeometry = (points) => {
    if (points.length < 3) return new THREE.BufferGeometry()

    // Calculate plane normal using Newell's method for better accuracy
    const normal = new THREE.Vector3()
    for (let i = 0; i < points.length; i++) {
      const curr = points[i]
      const next = points[(i + 1) % points.length]
      normal.x += (curr.y - next.y) * (curr.z + next.z)
      normal.y += (curr.z - next.z) * (curr.x + next.x)
      normal.z += (curr.x - next.x) * (curr.y + next.y)
    }
    normal.normalize()

    // Create local 2D coordinate system
    const center = points.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(points.length)
    const u = new THREE.Vector3().subVectors(points[1], points[0]).normalize()
    const v = new THREE.Vector3().crossVectors(normal, u).normalize()

    // Project to 2D
    const points2D = points.map((p) => {
      const relative = new THREE.Vector3().subVectors(p, center)
      return new THREE.Vector2(relative.dot(u), relative.dot(v))
    })

    // Create shape and geometry
    const shape = new THREE.Shape(points2D)
    const geometry = new THREE.ShapeGeometry(shape)

    // Transform back to 3D
    const matrix = new THREE.Matrix4().makeBasis(u, v, normal)
    geometry.applyMatrix4(matrix)
    geometry.translate(center.x, center.y, center.z)

    return geometry
  }

  // Enhanced metrics calculation
  const calculatePolygonMetrics = (points) => {
    if (points.length < 3) return { area: 0, perimeter: 0 }

    // Calculate perimeter
    let perimeter = 0
    for (let i = 0; i < points.length; i++) {
      const current = points[i]
      const next = points[(i + 1) % points.length]
      perimeter += current.distanceTo(next)
    }

    // Calculate area using the cross product method for 3D polygons
    let area = 0
    const center = points.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(points.length)

    for (let i = 0; i < points.length; i++) {
      const current = new THREE.Vector3().subVectors(points[i], center)
      const next = new THREE.Vector3().subVectors(points[(i + 1) % points.length], center)
      const cross = new THREE.Vector3().crossVectors(current, next)
      area += cross.length() / 2
    }

    return { area, perimeter }
  }

  // Enhanced UI updates
  const updateUI = useCallback(() => {
    const pointCount = pointsRef.current.length

    if (pointCount === 0) {
      setMessage("Tap on the surface to place your first point")
    } else if (pointCount === 1) {
      setMessage("Great! Tap to place the second point")
    } else if (pointCount === 2) {
      setMessage("Add more points or tap the first point to complete")
    } else if (pointCount >= 3 && !isComplete) {
      setMessage("Tap the red starting point to finish, or add more points")
    }
  }, [isComplete])

  // Enhanced controls
  const undo = useCallback(() => {
    if (pointsRef.current.length === 0 || isComplete) return

    // Remove last point
    pointsRef.current.pop()

    // Remove last marker
    const lastMarker = pointMarkersRef.current.pop()
    if (lastMarker && sceneRef.current) {
      sceneRef.current.remove(lastMarker)
      lastMarker.geometry.dispose()
    }

    // Update first point marker color if needed
    if (pointMarkersRef.current.length === 1) {
      pointMarkersRef.current[0].material.color.setHex(0xff4444)
    }

    updateShapes()
    updateUI()
  }, [isComplete])

  const resetAll = useCallback(() => {
    // Clear points
    pointsRef.current = []

    // Remove all markers
    pointMarkersRef.current.forEach((marker) => {
      if (sceneRef.current) {
        sceneRef.current.remove(marker)
        marker.geometry.dispose()
      }
    })
    pointMarkersRef.current = []

    // Clear geometries
    if (lineRef.current) {
      lineRef.current.geometry.dispose()
      lineRef.current.geometry = new THREE.BufferGeometry()
    }

    if (previewLineRef.current) {
      previewLineRef.current.geometry.dispose()
      previewLineRef.current.geometry = new THREE.BufferGeometry()
    }

    if (fillMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(fillMeshRef.current)
      fillMeshRef.current.geometry.dispose()
      fillMeshRef.current = null
    }

    // Reset state
    setMetrics({ area: 0, perimeter: 0, points: 0 })
    setIsComplete(false)
    setStep("measuring")
    setMessage("Tap on the surface to place your first point")
  }, [])

  const useThisArea = useCallback(() => {
    if (onAreaCalculated && metrics.area > 0) {
      onAreaCalculated(metrics.area)
    }
    if (onClose) {
      onClose()
    }
    cleanup()
  }, [metrics.area, onAreaCalculated, onClose])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (hitTestSourceRef.current?.cancel) {
      hitTestSourceRef.current.cancel()
    }
    if (rendererRef.current) {
      rendererRef.current.dispose()
    }
    if (xrRef.current && xrRef.current.end) {
      xrRef.current.end()
    }
    setRunning(false)
    setStep("detecting")
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={mountRef} className="absolute inset-0" />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Enhanced status bar */}
      <div className="absolute top-4 left-4 right-16 z-20 flex flex-col gap-3">
        {/* Calibration indicator */}
        {isCalibrating && running && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500/90 text-white shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="text-sm font-medium">Detecting surface... {Math.round(confidence * 100)}%</div>
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main info panel */}
        <div className="flex gap-3">
          <div className="flex-1 px-4 py-3 rounded-2xl bg-white/95 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  step === "detecting" ? "bg-amber-500" : step === "measuring" ? "bg-blue-500" : "bg-green-500"
                }`}
              ></div>
              <div className="font-semibold text-gray-800">
                {step === "detecting"
                  ? "Detecting Surface"
                  : step === "measuring"
                    ? "Measuring Area"
                    : "Measurement Complete"}
              </div>
            </div>
            <div className="text-sm text-gray-600 leading-tight">{message}</div>
          </div>

          {/* Help button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-12 h-12 rounded-xl bg-white/95 shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Metrics display */}
        {metrics.points > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="px-3 py-2 rounded-xl bg-white/95 shadow text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Points</div>
              <div className="text-lg font-bold text-gray-800">{metrics.points}</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/95 shadow text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Perimeter</div>
              <div className="text-lg font-bold text-gray-800">{metrics.perimeter.toFixed(1)}m</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white/95 shadow text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Area</div>
              <div className="text-lg font-bold text-blue-600">{metrics.area.toFixed(1)}m²</div>
            </div>
          </div>
        )}
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">How to Use</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>Point your phone at a flat surface like a roof or terrace</div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>Tap to place points around the area you want to measure</div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>Tap the red starting point to complete the measurement</div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>Use the measured area or start a new measurement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced bottom controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        {!running ? (
          <button
            onClick={startAR}
            disabled={supportsAR === false}
            className={`px-8 py-4 rounded-2xl font-semibold shadow-lg transition-all ${
              supportsAR === false
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-50 hover:shadow-xl"
            }`}
          >
            {supportsAR === false ? "AR Not Supported" : "Start AR Measurement"}
          </button>
        ) : (
          <div className="flex gap-3">
            {/* Undo button */}
            <button
              onClick={undo}
              disabled={metrics.points === 0 || isComplete}
              className="px-4 py-3 rounded-xl bg-white/95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>

            {/* Reset button */}
            <button onClick={resetAll} className="px-4 py-3 rounded-xl bg-white/95 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {isComplete && (
              <button
                onClick={useThisArea}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 font-medium"
              >
                Use This Area
              </button>
            )}

            {/* Complete button */}
            {metrics.points >= 3 && !isComplete && (
              <button
                onClick={completePolygon}
                className="px-6 py-3 rounded-xl bg-green-600 text-white shadow-lg hover:bg-green-700 font-medium"
              >
                Complete
              </button>
            )}
          </div>
        )}
      </div>

      {/* AR not supported message */}
      {supportsAR === false && (
        <div className="absolute inset-0 bg-black flex items-center justify-center text-center text-white p-8">
          <div>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="text-xl font-bold mb-2">WebXR AR Not Supported</div>
            <p className="text-gray-300 leading-relaxed">
              This tool requires WebXR support. Please try using:
              <br />• Chrome on a recent Android device
              <br />• Enable AR/VR flags in chrome://flags
              <br />• Use over HTTPS connection
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
