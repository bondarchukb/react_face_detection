import { Card, Container, Form } from "react-bootstrap";

import React, { useEffect, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { FaceDetection } from "@vladmandic/face-api";

import * as tf from "@tensorflow/tfjs";
import Canvas from "./components/Canvas";

const MODEL_URL = "/models";

const App = () => {
  const [imageFile, setImageFile] = useState<File>();
  const [predictions, setPredictions] = useState<FaceDetection[]>();
  const [image, setImage] = useState<HTMLImageElement>();

  const loadModel = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
  };

  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  const imageFieldChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImageFile((event.target as HTMLInputElement).files![0]);
  };

  const detectFaces = () => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const im = new Image();
      im.src = e.target.result;
      im.onload = async () => {
        setImage(im);
        setPredictions(
          await faceapi.detectAllFaces(
            im,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 })
          )
        );
      };
    };
    reader.readAsDataURL(imageFile);
  };

  useEffect(() => detectFaces(), [imageFile]);

  return (
    <Container>
      <Card>
        <Card.Body>
          <Form>
            <Form.Group>
              <Form.Label>Upload an image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={imageFieldChangeHandler}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
      {predictions && <Canvas predictions={predictions} image={image!} />}
    </Container>
  );
};

export default App;
