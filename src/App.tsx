import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam'
import './App.css';
import { Button, List, ListItem, ListItemText } from '@mui/material';
import { RekognitionClient, DetectTextCommand} from '@aws-sdk/client-rekognition';
import { Buffer } from 'buffer';

const rekognition = new RekognitionClient({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_KEY as string,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET as string
  }
});

const videoConstraints = {
  facingMode: "environment"
};


function DetectedText(props: any) {
  return (
    <ListItem key={props.detected.Id}>
      <ListItemText primary={props.detected.DetectedText} secondary={props.detected.Type} />
    </ListItem>
  )
}

function App() {
  const camRef = useRef<Webcam>(null)
  const [detections, setDetections] = useState<any[]>([])
  const capture = useCallback(async () => {
    if (camRef.current) {
      let imageSrc = camRef.current.getScreenshot();
      imageSrc = imageSrc?.replace('data:image/jpeg;base64,','') as string
      if (imageSrc) {
        const params = {
          Image: {
            Bytes: Buffer.from(imageSrc, 'base64')
          }
        };
        const command = new DetectTextCommand(params);
        
        try {
          const data = await rekognition.send(command);
          console.log(data)
          setDetections(data.TextDetections as any[])
        } catch (error) {
          console.error(error)
        }
      }
    }
  }, [camRef])
  return (
    <div className="App">
      <Webcam
        ref={camRef}
        audio={false}
        screenshotFormat="image/jpeg"
        forceScreenshotSourceSize={true}
        videoConstraints={videoConstraints}/>
      <List>
        {
          detections.map(detected => <DetectedText detected={detected}/>)
        }
      </List>
      <Button className="Capture" variant="contained" onClick={capture}>Scan</Button>
    </div>
  );
}

export default App;
