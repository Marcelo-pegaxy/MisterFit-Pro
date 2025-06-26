import React, { useRef, useEffect, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const SQUAT_KNEE_MIN = 90;
const SQUAT_KNEE_MAX = 120;

function calculateAngle(a, b, c) {
  // a, b, c: {x, y}
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const cb = { x: b.x - c.x, y: b.y - c.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const abLen = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const cbLen = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  const angle = Math.acos(dot / (abLen * cbLen));
  return (angle * 180) / Math.PI;
}

const ExerciseAnalyzer = ({ exerciseType = 'squat' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let camera = null;
    let pose = null;
    let animationId = null;

    async function runPose() {
      pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults);

      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setIsRunning(true);
    }

    function onResults(results) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1 });
        // Análise de agachamento (exemplo)
        if (exerciseType === 'squat') {
          const leftHip = results.poseLandmarks[23];
          const leftKnee = results.poseLandmarks[25];
          const leftAnkle = results.poseLandmarks[27];
          const rightHip = results.poseLandmarks[24];
          const rightKnee = results.poseLandmarks[26];
          const rightAnkle = results.poseLandmarks[28];
          if (leftHip && leftKnee && leftAnkle && rightHip && rightKnee && rightAnkle) {
            const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
            const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
            const avgKneeAngle = (leftAngle + rightAngle) / 2;
            setScore(Math.round(avgKneeAngle));
            if (avgKneeAngle >= SQUAT_KNEE_MIN && avgKneeAngle <= SQUAT_KNEE_MAX) {
              setFeedback('Ótima profundidade de agachamento!');
            } else if (avgKneeAngle < SQUAT_KNEE_MIN) {
              setFeedback('Desça mais para atingir a profundidade ideal.');
            } else {
              setFeedback('Não desça tanto, mantenha o controle do movimento.');
            }
          }
        }
      }
      ctx.restore();
    }

    runPose();
    return () => {
      if (camera) camera.stop();
      if (pose) pose.close();
      setIsRunning(false);
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line
  }, [exerciseType]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <video ref={videoRef} className="rounded-lg shadow" width={640} height={480} style={{ display: isRunning ? 'block' : 'none' }} autoPlay muted playsInline />
        <canvas ref={canvasRef} className="absolute top-0 left-0 rounded-lg" width={640} height={480} style={{ pointerEvents: 'none' }} />
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold">Feedback:</div>
        <div className="text-xl text-blue-600 font-semibold">{feedback}</div>
        {score !== null && <div className="mt-2 text-gray-700">Ângulo do joelho: <span className="font-bold">{score}°</span></div>}
      </div>
    </div>
  );
};

export default ExerciseAnalyzer; 